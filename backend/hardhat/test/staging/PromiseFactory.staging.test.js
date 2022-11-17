const { assert, expect } = require('chai');
const {
  developmentChains,
  LINK_TOKEN_MUMBAI,
} = require('../../helper-hardhat-config');
const { deployments, network, ethers } = require('hardhat');

const REQUIRED_LINK_AMOUNT_FOR_TESTS = ethers.utils.parseEther('0.8');

developmentChains.includes(network.name)
  ? describe.skip
  : describe.only('PromiseFactory staging tests', function() {
      let deployer;
      let user;
      let promiseFactoryDeploy;
      let promiseFactory;
      let verifyStorage;
      let args = {};

      const createCorrectPromiseContract = async () => {
        console.log('Creating promise contract...');
        const tx = await promiseFactory.createPromiseContract(
          args.name,
          args.ipfsCid,
          args.arweaveId,
          args.encryptedProof,
          args.partyNames,
          args.partyTwitters,
          args.partyAddresses,
        );
        const txReceipt = await tx.wait(1);
        console.log('Promise contract created.');

        return { tx, txReceipt };
      };

      before(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        user = accounts[1];

        console.log('Deploying contracts...');
        await deployments.fixture('main');
        promiseFactoryDeploy = await ethers.getContract('PromiseFactory');
        console.log('Deployed contracts.');
        promiseFactory = promiseFactoryDeploy.connect(deployer);
        verifyStorage = await ethers.getContract('VerifyStorage', deployer);

        // Set the allowed verifier (VerifyStorage address) if needed
        console.log('Setting allowed verifier...');
        await promiseFactory.setStorageVerifier(verifyStorage.address);
        console.log('Allowed verifier set.');

        // Fund the VerifyTwitter contract with LINK if the balance is < 0.2 LINK
        const linkBalance = await verifyStorage.getLinkBalance();

        if (linkBalance < REQUIRED_LINK_AMOUNT_FOR_TESTS) {
          console.log('Funding VerifyStorage contract with LINK...');
          const linkToken = await ethers.getContractAt(
            '@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol:LinkTokenInterface',
            LINK_TOKEN_MUMBAI,
            deployer,
          );
          await linkToken.transfer(
            verifyStorage.address,
            REQUIRED_LINK_AMOUNT_FOR_TESTS,
          );
          console.log('Waiting for VerifyStorage contract to receive LINK...');

          // Wait for the VerifyStorage contract to receive the LINK
          let balance = await verifyStorage.getLinkBalance();
          while (balance < REQUIRED_LINK_AMOUNT_FOR_TESTS) {
            console.log('Waiting...');
            await new Promise((r) => setTimeout(r, 5000));
            balance = await verifyStorage.getLinkBalance();
          }
          console.log('Funding complete.');
        }

        args = {
          name: 'Test promise',
          ipfsCid:
            'bafybeieyah7pyu3mrreajpt4yp7fxzkjzhpir6wu4c6ofg42o57htgmfeq',
          arweaveId: '35wFhCNgA8upsCl-jNQvdXOKCXzO8vx1OeEspMcl3jY',
          encryptedProof:
            '0xd614539bd56636494f7bc02e21a53e02f93850cabc465ae830d62e94beba1af3',
          partyNames: ['Bob'],
          partyTwitters: ['@bob'],
          partyAddresses: [deployer.address],
        };
      });

      describe('constructor', function() {
        it('Should initialize the variables with the right value', async () => {
          const owner = await promiseFactory.getOwner();

          assert.equal(owner, deployer.address);
        });
      });

      describe('createPromiseContract', function() {
        it('Should revert if one of the required fields is empty', async () => {
          await expect(
            promiseFactory.createPromiseContract(
              args.name,
              args.ipfsCid,
              [],
              args.encryptedProof,
              [],
              [],
              [],
            ),
          ).to.be.revertedWith('PromiseFactory__EMPTY_FIELD()');

          await expect(
            promiseFactory.createPromiseContract(
              '',
              args.ipfsCid,
              args.arweaveId,
              args.encryptedProof,
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
              args.ipfsCid,
              args.arweaveId,
              args.encryptedProof,
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
              args.ipfsCid,
              args.arweaveId,
              args.encryptedProof,
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
              args.ipfsCid,
              args.arweaveId,
              args.encryptedProof,
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
              args.ipfsCid,
              args.arweaveId,
              args.encryptedProof,
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
              args.ipfsCid,
              args.arweaveId,
              args.encryptedProof,
              partyNames,
              args.partyTwitters,
              args.partyAddresses,
            ),
          ).to.be.revertedWith(
            "VM Exception while processing transaction: reverted with custom error 'PromiseContract__createParticipant__INCORRECT_FIELD_LENGTH()",
          );
        });

        it('Should create a new PromiseContract and create a mapping between the sender and the child contract addresses', async () => {
          const { txReceipt } = await createCorrectPromiseContract();
          const promiseContractAddress = txReceipt.events[1].address;
          const promiseContract = await ethers.getContractAt(
            'PromiseContract',
            promiseContractAddress,
          );
          const promiseContractOwner = await promiseContract.getOwner();

          const receivedPromiseContractAddresses = await promiseFactory.getPromiseContractAddresses(
            deployer.address,
          );

          assert.equal(promiseContractOwner, deployer.address);
          assert.equal(
            receivedPromiseContractAddresses[0],
            promiseContractAddress,
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
              args.ipfsCid,
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
        it('Should not allow anyone other than the VerifyTwitter contract to add a Twitter verified user', async () => {
          await expect(
            promiseFactory.addTwitterVerifiedUser(deployer.address, 'username'),
          ).to.be.revertedWith('PromiseFactory__NOT_VERIFIER()');
        });

        it('Should not allow anyone else than the owner to call `setTwitterVerifier`', async () => {
          await expect(
            promiseFactory.connect(user).setTwitterVerifier(user.address),
          ).to.be.revertedWith('PromiseFactory__NOT_OWNER()');
        });

        // The rest of the tests are performed in ./VerifyTwitter.staging.test.js
      });

      describe('updateStorageStatus', function() {
        it('Should not allow anyone other than the VerifyStorage contract to update the storage status', async () => {
          const { txReceipt } = await createCorrectPromiseContract();
          promiseContractAddress = txReceipt.events[1].address;
          promiseContract = await ethers.getContractAt(
            'PromiseContract',
            promiseContractAddress,
          );

          await expect(
            promiseFactory.updateStorageStatus(promiseContract.address, 1),
          ).to.be.revertedWith('PromiseFactory__NOT_VERIFIER()');
        });

        it('Should not allow anyone else than the owner to call `setStorageVerifier`', async () => {
          await expect(
            promiseFactory.connect(user).setStorageVerifier(user.address),
          ).to.be.revertedWith('PromiseFactory__NOT_OWNER()');
        });

        // The rest of the tests are performed in VerifyStorage.staging.test.js
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

        it('Should revert if the sender is not a participant the PromiseContract', async () => {
          await expect(
            promiseFactory
              .connect(user)
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
              user.address,
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
            user.address,
          );

          const participant = await promiseContract.getParticipant(
            user.address,
          );

          assert.equal(participant.participantName, 'Charlie');
          assert.equal(participant.participantTwitterHandle, 'charlie');
          assert.equal(participant.participantAddress, user.address);

          expect(tx)
            .to.emit(promiseFactory, 'ParticipantAdded')
            .withArgs(
              promiseContract.address,
              'Charlie',
              'charlie',
              user.address,
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
            user.address,
          );

          assert.equal(
            await promiseContract.getIsPromiseApproved(deployer.address),
            false,
          );
        });
      });
    });
