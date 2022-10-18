const { assert, expect } = require('chai');
const { developmentChains } = require('../../helper-hardhat-config');
const { deployments, network, ethers } = require('hardhat');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('MasterContract unit tests', function() {
      let deployer;
      let userFirst;
      let userSecond;
      let userForbidden;
      let childContractDeploy;
      let childContract;
      let deployTxReceipt;

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        userFirst = accounts[1];
        userSecond = accounts[2];
        userForbidden = accounts[3];
        await deployments.fixture('main');
        const masterContract = (
          await ethers.getContract('MasterContract')
        ).connect(userFirst);

        const deployTx = await masterContract.createContract(
          'Test Agreement',
          'ipfs://mockURI',
          ['Bob', 'Alice'],
          ['@bob', '@alice'],
          [userFirst.address, userSecond.address],
        );
        deployTxReceipt = await deployTx.wait(1);
        const childContractAddress = deployTxReceipt.events[1].address;

        childContractDeploy = await ethers.getContractAt(
          'ChildContract',
          childContractAddress,
        );
        childContract = childContractDeploy.connect(userFirst);
      });

      describe('constructor', function() {
        it('Should initialize the variables with the right value', async () => {
          const owner = await childContract.getOwner();
          const name = await childContract.getName();
          const uri = await childContract.getPdfUri();
          const participantCount = await childContract.getParticipantCount();

          assert.equal(owner, userFirst.address);
          assert.equal(name, 'Test Agreement');
          assert.equal(uri, 'ipfs://mockURI');
          assert.equal(participantCount, 2);
        });
      });

      describe('createParticipant', function() {
        it('Should create a mapping between the participants addresses and a struct Participant', async () => {
          const participant = await childContract.getParticipant(
            userFirst.address,
          );

          assert.equal(participant.participantName, 'Bob');
          assert.equal(participant.participantTwitterHandle, '@bob');
          assert.equal(participant.participantAddress, userFirst.address);
        });

        it('Should emit an event ParticipantCreated with the right arguments', async () => {
          // Here the child contract will emit and event once created by the master contract
          // So we need to access the events from the child contract
          const filter = childContract.filters.ParticipantCreated();
          const logs = await childContract.queryFilter(filter);

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
          const participantAddresses = await childContract.getParticipantAddresses();
          const firstParticipantAddress = participantAddresses[0];
          const secondParticipantAddress = participantAddresses[1];

          assert.equal(firstParticipantAddress, userFirst.address);
          assert.equal(secondParticipantAddress, userSecond.address);

          await expect(
            childContract.getParticipant(userForbidden.address),
          ).to.be.revertedWith('ChildContract__NOT_PARTICIPANT');
        });
      });

      describe('approveAgreement', function() {
        let txReceipt;

        beforeEach(async () => {
          const tx = await childContract.approveAgreement();
          txReceipt = await tx.wait(1);
        });

        it('Should approve the agreement for the user', async () => {
          const isApproved = await childContract.getIsAgreementApproved(
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
            childContract.connect(userForbidden).approveAgreement(),
          ).to.be.revertedWith('ChildContract__NOT_PARTICIPANT()');
        });

        it('Should revert if the user has already approved the agreement', async () => {
          await expect(childContract.approveAgreement()).to.be.revertedWith(
            'ChildContract__approveAgreement__ALREADY_APPROVED()',
          );
        });

        it('Should revert if the agreement is locked', async () => {
          await childContract.connect(userSecond).approveAgreement();
          await childContract.lockAgreement();
          await expect(childContract.approveAgreement()).to.be.revertedWith(
            'ChildContract__AGREEMENT_LOCKED()',
          );
        });
      });

      describe('lockAgreement', function() {
        let txReceipt;

        beforeEach(async () => {
          await childContract.approveAgreement();
        });

        it('Should not allow to lock the agreement if not all participants have approved', async () => {
          await expect(childContract.lockAgreement()).to.be.revertedWith(
            'ChildContract__lockAgreement__PARTICIPANT_NOT_APPROVED()',
          );
        });

        it('Should lock the agreement if all users have approved', async () => {
          await childContract.connect(userSecond).approveAgreement();
          await childContract.lockAgreement();
          const isLocked = await childContract.getIsAgreementLocked();

          assert.equal(isLocked, true);
        });

        it('Should emit an event AgreementLocked with the right arguments', async () => {
          await childContract.connect(userSecond).approveAgreement();

          expect(await childContract.lockAgreement()).to.emit(
            childContract,
            'AgreementLocked',
          );
        });

        it('Should revert if the user is not a participant', async () => {
          await expect(
            childContract.connect(userForbidden).lockAgreement(),
          ).to.be.revertedWith('ChildContract__NOT_PARTICIPANT()');
        });

        it('Should revert if the agreement is already locked', async () => {
          await childContract.connect(userSecond).approveAgreement();
          await childContract.lockAgreement();

          await expect(childContract.lockAgreement()).to.be.revertedWith(
            'ChildContract__AGREEMENT_LOCKED()',
          );
        });
      });
    });
