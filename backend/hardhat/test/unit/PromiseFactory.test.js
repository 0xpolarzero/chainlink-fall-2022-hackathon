const { assert, expect } = require('chai');
const {
  developmentChains,
  VERIFY_TWITTER_MUMBAI,
} = require('../../helper-hardhat-config');
const { deployments, network, ethers } = require('hardhat');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('PromiseFactory unit tests', function() {
      let deployer;
      let user;
      let notUser;
      let promiseFactoryDeploy;
      let promiseFactory;
      let args = {};

      const createCorrectPromiseContract = async () => {
        const tx = await promiseFactory.createPromiseContract(
          args.name,
          args.cid,
          args.partyNames,
          args.partyTwitters,
          args.partyAddresses,
        );
        const txReceipt = await tx.wait(1);

        return { tx, txReceipt };
      };

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        user = accounts[1];
        notUser = accounts[2];
        await deployments.fixture('main');
        promiseFactoryDeploy = await ethers.getContract('PromiseFactory');
        promiseFactory = promiseFactoryDeploy.connect(deployer);
        args = {
          name: 'Test Agreement',
          cid: 'bafybeieyah7pyu3mrreajpt4yp7fxzkjzhpir6wu4c6ofg42o57htgmfeq',
          partyNames: ['Bob', 'Alice'],
          partyTwitters: ['@bob', '@alice'],
          partyAddresses: [deployer.address, user.address],
        };
      });

      describe('constructor', function() {
        it('Should initialize the variables with the right value', async () => {
          const owner = await promiseFactory.getOwner();
          const verifier = await promiseFactory.getVerifier();

          assert.equal(owner, deployer.address);
          assert.equal(verifier, VERIFY_TWITTER_MUMBAI);
        });
      });

      describe('createPromiseContract', function() {
        it('Should revert if one of the required fields is empty', async () => {
          await expect(
            promiseFactory.createPromiseContract(
              args.name,
              args.cid,
              [],
              [],
              [],
            ),
          ).to.be.revertedWith('PromiseFactory__EMPTY_FIELD()');

          await expect(
            promiseFactory.createPromiseContract(
              '',
              args.cid,
              args.partyNames,
              args.partyTwitters,
              args.partyAddresses,
            ),
          ).to.be.revertedWith('PromiseFactory__EMPTY_FIELD()');
        });

        it('Should revert if there is a mismatch between names and addresses length', async () => {
          await expect(
            promiseFactory.createPromiseContract(
              args.name,
              args.cid,
              args.partyNames,
              args.partyTwitters,
              [deployer.address],
            ),
          ).to.be.revertedWith('PromiseFactory__INCORRECT_FIELD_LENGTH()');
        });

        it('Should revert if the same address or Twitter handle is used twice', async () => {
          await expect(
            promiseFactory.createPromiseContract(
              args.name,
              args.cid,
              args.partyNames,
              args.partyTwitters,
              [deployer.address, deployer.address],
            ),
          ).to.be.revertedWith(
            'PromiseFactory__createPromiseContract__DUPLICATE_FIELD()',
          );

          await expect(
            promiseFactory.createPromiseContract(
              args.name,
              args.cid,
              args.partyNames,
              ['@bob', '@bob'],
              args.partyAddresses,
            ),
          ).to.be.revertedWith(
            'PromiseFactory__createPromiseContract__DUPLICATE_FIELD()',
          );
        });

        it('Should revert if the promise name is more than 70 characters', async () => {
          const name = 'a'.repeat(71);
          await expect(
            promiseFactory.createPromiseContract(
              name,
              args.cid,
              args.partyNames,
              args.partyTwitters,
              args.partyAddresses,
            ),
          ).to.be.revertedWith('PromiseFactory__INCORRECT_FIELD_LENGTH()');
        });

        it('Should revert if any of the participant name is more than 30 characters', async () => {
          const partyNames = ['a'.repeat(31), 'b'.repeat(15)];
          await expect(
            promiseFactory.createPromiseContract(
              args.name,
              args.cid,
              partyNames,
              args.partyTwitters,
              args.partyAddresses,
            ),
          ).to.be.revertedWith('PromiseFactory__INCORRECT_FIELD_LENGTH()');
        });

        it('Should create a new PromiseContract', async () => {
          const { txReceipt } = await createCorrectPromiseContract();
          const promiseContractAddress = txReceipt.events[1].address;
          const promiseContract = await ethers.getContractAt(
            'PromiseContract',
            promiseContractAddress,
          );
          const promiseContractOwner = await promiseContract.getOwner();

          assert.equal(promiseContractOwner, deployer.address);
        });

        it('Should create a mapping between the sender and the child contract addresses', async () => {
          const { txReceipt } = await createCorrectPromiseContract();
          const expectedPromiseContractAddress = txReceipt.events[1].address;

          const receivedPromiseContractAddresses = await promiseFactory.getPromiseContractAddresses(
            deployer.address,
          );

          assert.equal(
            receivedPromiseContractAddresses[0],
            expectedPromiseContractAddress,
          );
        });

        it('Should emit a PromiseContractCreated event with the right arguments', async () => {
          const { tx, txReceipt } = await createCorrectPromiseContract();
          const promiseContractAddress = txReceipt.events[1].address;

          expect(tx)
            .to.emit(promiseFactory, 'PromiseContractCreated')
            .withArgs(
              deployer.address,
              promiseContractAddress,
              args.name,
              args.cid,
              args.partyNames,
              args.partyTwitters,
              args.partyAddresses,
            );
        });

        it('Should return the correct number of child contracts for a user', async () => {
          await createCorrectPromiseContract();
          await createCorrectPromiseContract();

          const promiseContractsLength = await promiseFactory.getPromiseContractCount(
            deployer.address,
          );
          assert.equal(promiseContractsLength, 2);
        });
      });

      describe('addTwitterVerifiedUser', function() {
        it('Should not allow anyone other than the TwitterVerification contract to add a Twitter verified user', async () => {
          await expect(
            promiseFactory.addTwitterVerifiedUser(deployer.address, 'username'),
          ).to.be.revertedWith('PromiseFactory__NOT_VERIFIER()');
        });

        it('Should not allow anyone else than the owner to call `setVerifier`', async () => {
          await expect(
            promiseFactory.connect(user).setVerifier(user.address),
          ).to.be.revertedWith('PromiseFactory__NOT_OWNER()');
        });

        // The rest of the tests are performed in ./VerifyTwitter.test.js
      });

      describe('addParticipant', function() {
        beforeEach(async () => {
          const { txReceipt } = await createCorrectPromiseContract();
          promiseContractAddress = txReceipt.events[1].address;
          promiseContract = await ethers.getContractAt(
            'PromiseContract',
            promiseContractAddress,
          );
        });

        it('Should revert if one of the fields is empty', async () => {
          // Here the error message is not the same as in the contract because
          // the contract is not called directly but through the factory
          await expect(
            promiseFactory.addParticipant(
              promiseContract.address,
              '',
              'handle',
              deployer.address,
            ),
          ).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with custom error 'PromiseFactory__EMPTY_FIELD()",
          );
          await expect(
            promiseFactory.addParticipant(
              promiseContract.address,
              'name',
              '',
              deployer.address,
            ),
          ).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with custom error 'PromiseFactory__EMPTY_FIELD()",
          );
        });

        it('Should revert if the sender is not a participant the PromiseContract', async () => {
          await expect(
            promiseFactory
              .connect(notUser)
              .addParticipant(
                promiseContract.address,
                'name',
                'handle',
                user.address,
              ),
          ).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with custom error 'PromiseFactory__addParticipant__NOT_PARTICIPANT()'",
          );
        });

        it('Should revert if the participant is already in the PromiseContract', async () => {
          await expect(
            promiseFactory.addParticipant(
              promiseContract.address,
              'name',
              'handle',
              deployer.address,
            ),
          ).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with custom error 'PromiseFactory__addParticipant__ALREADY_PARTICIPANT()'",
          );
        });

        it('Should revert if the participant name is more than 30 characters', async () => {
          const { txReceipt } = await createCorrectPromiseContract();
          const promiseContractAddress = txReceipt.events[1].address;
          const promiseContract = await ethers.getContractAt(
            'PromiseContract',
            promiseContractAddress,
          );

          await expect(
            promiseFactory.addParticipant(
              promiseContract.address,
              'a'.repeat(31),
              'handle',
              notUser.address,
            ),
          ).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with custom error 'PromiseFactory__INCORRECT_FIELD_LENGTH()'",
          );
        });

        it('Should add a participant to the PromiseContract and emit an event', async () => {
          const tx = await promiseFactory.addParticipant(
            promiseContract.address,
            'Charlie',
            'charlie',
            notUser.address,
          );

          const participant = await promiseContract.getParticipant(
            notUser.address,
          );

          assert.equal(participant.participantName, 'Charlie');
          assert.equal(participant.participantTwitterHandle, 'charlie');
          assert.equal(participant.participantAddress, notUser.address);

          expect(tx)
            .to.emit(promiseFactory, 'ParticipantAdded')
            .withArgs(
              promiseContract.address,
              'Charlie',
              'charlie',
              notUser.address,
            );
        });

        it('Should disapprove the contract for each participant, so they can approve the new status', async () => {
          await promiseContract.approvePromise();
          assert.equal(
            await promiseContract.getIsPromiseApproved(deployer.address),
            true,
          );

          await promiseFactory.addParticipant(
            promiseContract.address,
            'Charlie',
            'charlie',
            notUser.address,
          );

          assert.equal(
            await promiseContract.getIsPromiseApproved(deployer.address),
            false,
          );
        });
      });
    });
