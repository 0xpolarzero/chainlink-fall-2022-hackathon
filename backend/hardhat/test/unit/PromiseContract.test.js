const { assert, expect } = require('chai');
const { developmentChains } = require('../../helper-hardhat-config');
const { deployments, network, ethers } = require('hardhat');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('PromiseFactory unit tests', function() {
      let deployer;
      let userFirst;
      let userSecond;
      let userForbidden;
      let promiseContractDeploy;
      let promiseContract;
      let deployTxReceipt;

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        userFirst = accounts[1];
        userSecond = accounts[2];
        userForbidden = accounts[3];
        await deployments.fixture('main');
        const promiseFactory = (
          await ethers.getContract('PromiseFactory')
        ).connect(userFirst);

        const deployTx = await promiseFactory.createPromiseContract(
          'Test Agreement',
          'ipfs://mockURI',
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
          const uri = await promiseContract.getPdfUri();
          const participantCount = await promiseContract.getParticipantCount();

          assert.equal(owner, userFirst.address);
          assert.equal(name, 'Test Agreement');
          assert.equal(uri, 'ipfs://mockURI');
          assert.equal(participantCount, 2);
        });
      });

      describe('createParticipant', function() {
        it('Should create a mapping between the participants addresses and a struct Participant', async () => {
          const participant = await promiseContract.getParticipant(
            userFirst.address,
          );

          assert.equal(participant.participantName, 'Bob');
          assert.equal(participant.participantTwitterHandle, '@bob');
          assert.equal(participant.participantAddress, userFirst.address);
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

        it('Should be able to get a list of addresses and get a participant only if the address is in the list', async () => {
          const participantAddresses = await promiseContract.getParticipantAddresses();
          const firstParticipantAddress = participantAddresses[0];
          const secondParticipantAddress = participantAddresses[1];

          assert.equal(firstParticipantAddress, userFirst.address);
          assert.equal(secondParticipantAddress, userSecond.address);

          await expect(
            promiseContract.getParticipant(userForbidden.address),
          ).to.be.revertedWith('PromiseContract__NOT_PARTICIPANT');
        });
      });

      describe('approveAgreement', function() {
        let txReceipt;

        beforeEach(async () => {
          const tx = await promiseContract.approveAgreement();
          txReceipt = await tx.wait(1);
        });

        it('Should approve the agreement for the user', async () => {
          const isApproved = await promiseContract.getIsAgreementApproved(
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
            promiseContract.connect(userForbidden).approveAgreement(),
          ).to.be.revertedWith('PromiseContract__NOT_PARTICIPANT()');
        });

        it('Should revert if the user has already approved the agreement', async () => {
          await expect(promiseContract.approveAgreement()).to.be.revertedWith(
            'PromiseContract__approveAgreement__ALREADY_APPROVED()',
          );
        });

        it('Should revert if the agreement is locked', async () => {
          await promiseContract.connect(userSecond).approveAgreement();
          await promiseContract.lockAgreement();
          await expect(promiseContract.approveAgreement()).to.be.revertedWith(
            'PromiseContract__AGREEMENT_LOCKED()',
          );
        });
      });

      describe('lockAgreement', function() {
        let txReceipt;

        beforeEach(async () => {
          await promiseContract.approveAgreement();
        });

        it('Should not allow to lock the agreement if not all participants have approved', async () => {
          await expect(promiseContract.lockAgreement()).to.be.revertedWith(
            'PromiseContract__lockAgreement__PARTICIPANT_NOT_APPROVED()',
          );
        });

        it('Should lock the agreement if all users have approved', async () => {
          await promiseContract.connect(userSecond).approveAgreement();
          await promiseContract.lockAgreement();
          const isLocked = await promiseContract.getIsAgreementLocked();

          assert.equal(isLocked, true);
        });

        it('Should emit an event AgreementLocked with the right arguments', async () => {
          await promiseContract.connect(userSecond).approveAgreement();

          expect(await promiseContract.lockAgreement()).to.emit(
            promiseContract,
            'AgreementLocked',
          );
        });

        it('Should revert if the user is not a participant', async () => {
          await expect(
            promiseContract.connect(userForbidden).lockAgreement(),
          ).to.be.revertedWith('PromiseContract__NOT_PARTICIPANT()');
        });

        it('Should revert if the agreement is already locked', async () => {
          await promiseContract.connect(userSecond).approveAgreement();
          await promiseContract.lockAgreement();

          await expect(promiseContract.lockAgreement()).to.be.revertedWith(
            'PromiseContract__AGREEMENT_LOCKED()',
          );
        });
      });
    });
