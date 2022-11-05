const { assert, expect } = require('chai');
const { developmentChains } = require('../../helper-hardhat-config');
const { deployments, network, ethers } = require('hardhat');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('PromiseContract unit tests', function() {
      let deployer;
      let userFirst;
      let userSecond;
      let notUser;
      let promiseFactory;
      let promiseContractDeploy;
      let promiseContract;
      let deployTxReceipt;

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        userFirst = accounts[1];
        userSecond = accounts[2];
        notUser = accounts[3];
        await deployments.fixture('main');
        promiseFactory = (await ethers.getContract('PromiseFactory')).connect(
          userFirst,
        );

        const deployTx = await promiseFactory.createPromiseContract(
          'Test Agreement',
          'bafybeieyah7pyu3mrreajpt4yp7fxzkjzhpir6wu4c6ofg42o57htgmfeq',
          ['Bob', 'Alice'],
          ['@bob', '@alice'],
          [userFirst.address, userSecond.address],
        );
        deployTxReceipt = await deployTx.wait(1);
        const promiseContractAddress = deployTxReceipt.events[1].address;

        promiseContractDeploy = await ethers.getContractAt(
          'PromiseContract',
          promiseContractAddress,
        );
        promiseContract = promiseContractDeploy.connect(userFirst);
      });

      describe('constructor', function() {
        it('Should initialize the variables with the right value', async () => {
          const owner = await promiseContract.getOwner();
          const name = await promiseContract.getName();
          const cid = await promiseContract.getIpfsCid();
          const participantCount = await promiseContract.getParticipantCount();

          assert.equal(owner, userFirst.address);
          assert.equal(name, 'Test Agreement');
          assert.equal(
            cid,
            'bafybeieyah7pyu3mrreajpt4yp7fxzkjzhpir6wu4c6ofg42o57htgmfeq',
          );
          assert.equal(participantCount, 2);
        });
      });

      describe('createParticipant', function() {
        it('Should not allow to create a participant if the caller is not the PromiseFactory', async () => {
          await expect(
            promiseContractDeploy.createParticipant(
              'Bob',
              '@bob',
              userFirst.address,
            ),
          ).to.be.revertedWith('PromiseContract__NOT_FACTORY()');
        });

        it('Should not allow to create a participant if the promise is locked', async () => {
          // Approve all participants
          promiseContract.connect(userFirst).approvePromise();
          promiseContract.connect(userSecond).approvePromise();
          await promiseContract.lockPromise();

          await expect(
            promiseFactory.addParticipant(
              promiseContract.address,
              'Bob',
              '@bob',
              notUser.address,
            ),
          ).to.be.revertedWith('PromiseContract__PROMISE_LOCKED()');
        });

        it('Should create a mapping between the participants addresses and a struct Participant', async () => {
          const participant = await promiseContract.getParticipant(
            userFirst.address,
          );

          const notParticipant = await promiseContract.getParticipant(
            notUser.address,
          );

          assert.equal(participant.participantName, 'Bob');
          assert.equal(participant.participantTwitterHandle, '@bob');
          assert.equal(participant.participantAddress, userFirst.address);
          assert.equal(notParticipant.participantName, '');
          assert.equal(notParticipant.participantTwitterHandle, '');
          assert.equal(
            notParticipant.participantAddress,
            '0x0000000000000000000000000000000000000000',
          );
        });

        it('Should emit an event ParticipantCreated with the right arguments', async () => {
          // Here the child contract will emit and event once created by the master contract
          // So we need to access the events from the child contract
          const filter = promiseContract.filters.ParticipantCreated();
          const logs = await promiseContract.queryFilter(filter);

          const participantFirst = {
            name: logs[0].args.participantName,
            twitter: logs[0].args.participantTwitterHandle,
            address: logs[0].args.participantAddress,
          };

          const participantSecond = {
            name: logs[1].args.participantName,
            twitter: logs[1].args.participantTwitterHandle,
            address: logs[1].args.participantAddress,
          };

          assert(
            logs[0].event === 'ParticipantCreated' &&
              logs[1].event === 'ParticipantCreated',
          );

          assert.equal(participantFirst.name, 'Bob');
          assert.equal(participantFirst.twitter, '@bob');
          assert.equal(participantFirst.address, userFirst.address);

          assert.equal(participantSecond.name, 'Alice');
          assert.equal(participantSecond.twitter, '@alice');
          assert.equal(participantSecond.address, userSecond.address);
        });

        it('Should be able to tell if an address corresponds to a participant', async () => {
          expect(
            await promiseContract.getIsParticipant(userFirst.address),
          ).to.equal(true);

          expect(
            await promiseContract.getIsParticipant(userSecond.address),
          ).to.equal(true);

          expect(
            await promiseContract.getIsParticipant(notUser.address),
          ).to.equal(false);
        });
      });

      describe('approvePromise', function() {
        let txReceipt;

        beforeEach(async () => {
          const tx = await promiseContract.approvePromise();
          txReceipt = await tx.wait(1);
        });

        it('Should approve the promise for the user', async () => {
          const isApproved = await promiseContract.getIsPromiseApproved(
            userFirst.address,
          );

          assert.equal(isApproved, true);
        });

        it('Should emit an event AgreementApproved with the right arguments', async () => {
          const event = txReceipt.events[0];

          assert.equal(event.event, 'ParticipantApproved');
          assert.equal(event.args.participantAddress, userFirst.address);
          assert.equal(event.args.participantName, 'Bob');
          assert.equal(event.args.participantTwitterHandle, '@bob');
        });

        it('Should revert if the user is not a participant', async () => {
          await expect(
            promiseContract.connect(notUser).approvePromise(),
          ).to.be.revertedWith('PromiseContract__NOT_PARTICIPANT()');
        });

        it('Should revert if the user has already approved the promise', async () => {
          await expect(promiseContract.approvePromise()).to.be.revertedWith(
            'PromiseContract__approvePromise__ALREADY_APPROVED()',
          );
        });

        it('Should revert if the promise is locked', async () => {
          await promiseContract.connect(userSecond).approvePromise();
          await promiseContract.lockPromise();
          await expect(promiseContract.approvePromise()).to.be.revertedWith(
            'PromiseContract__PROMISE_LOCKED()',
          );
        });
      });

      describe('lockPromise', function() {
        beforeEach(async () => {
          await promiseContract.approvePromise();
        });

        it('Should not allow to lock the promise if not all participants have approved', async () => {
          await expect(promiseContract.lockPromise()).to.be.revertedWith(
            'PromiseContract__lockPromise__PARTICIPANT_NOT_APPROVED()',
          );
        });

        it('Should lock the promise if all users have approved', async () => {
          await promiseContract.connect(userSecond).approvePromise();
          await promiseContract.lockPromise();
          const isLocked = await promiseContract.getIsPromiseLocked();

          assert.equal(isLocked, true);
        });

        it('Should emit an event AgreementLocked with the right arguments', async () => {
          await promiseContract.connect(userSecond).approvePromise();

          expect(await promiseContract.lockPromise()).to.emit(
            promiseContract,
            'AgreementLocked',
          );
        });

        it('Should revert if the user is not a participant', async () => {
          await expect(
            promiseContract.connect(notUser).lockPromise(),
          ).to.be.revertedWith('PromiseContract__NOT_PARTICIPANT()');
        });

        it('Should revert if the promise is already locked', async () => {
          await promiseContract.connect(userSecond).approvePromise();
          await promiseContract.lockPromise();

          await expect(promiseContract.lockPromise()).to.be.revertedWith(
            'PromiseContract__PROMISE_LOCKED()',
          );
        });
      });
    });
