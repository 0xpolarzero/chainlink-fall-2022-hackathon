const { assert, expect } = require('chai');
const {
  developmentChains,
  LINK_TOKEN_MUMBAI,
} = require('../../helper-hardhat-config');
const { deployments, network, ethers } = require('hardhat');

const REQUIRED_LINK_AMOUNT_FOR_TESTS = ethers.utils.parseEther('0.7');
const IPFS_CID = 'bafybeieyah7pyu3mrreajpt4yp7fxzkjzhpir6wu4c6ofg42o57htgmfeq';
const ARWEAVE_ID = '35wFhCNgA8upsCl-jNQvdXOKCXzO8vx1OeEspMcl3jY';
const ENCRYPTED_PROOF =
  '0xd614539bd56636494f7bc02e21a53e02f93850cabc465ae830d62e94beba1af3';
const PARTY_NAMES = ['Bob'];
const PARTY_TWITTER = ['bob'];

// For some reason, custom errors are not being thrown in staging tests
// so we are not describing the error cases here

developmentChains.includes(network.name)
  ? describe.skip
  : describe('PromiseFactory staging tests', function() {
      let deployer;
      let user;
      let promiseFactoryDeploy;
      let promiseFactory;
      let verifyStorage;

      const createPromiseContract = async (testIdentifier, partyAddresses) => {
        console.log('Creating promise contract...');
        const tx = await promiseFactory.createPromiseContract(
          testIdentifier,
          IPFS_CID,
          ARWEAVE_ID,
          ENCRYPTED_PROOF,
          PARTY_NAMES,
          PARTY_TWITTER,
          partyAddresses,
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
        await deployments.fixture(['promise-factory', 'verify-storage']);
        console.log('Deployed contracts.');

        promiseFactoryDeploy = await ethers.getContract('PromiseFactory');
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
              'Test',
              IPFS_CID,
              [],
              ENCRYPTED_PROOF,
              [],
              [],
              [],
            ),
          ).to.be.reverted;

          await expect(
            promiseFactory.createPromiseContract(
              '',
              IPFS_CID,
              ARWEAVE_ID,
              ENCRYPTED_PROOF,
              PARTY_NAMES,
              PARTY_TWITTER,
              [deployer.address],
            ),
          ).to.be.reverted;
        });

        it('Should revert if there is a mismatch between names and addresses length', async () => {
          await expect(
            promiseFactory.createPromiseContract(
              'Test',
              IPFS_CID,
              ARWEAVE_ID,
              ENCRYPTED_PROOF,
              PARTY_NAMES,
              PARTY_TWITTER,
              [deployer.address, user.address],
            ),
          ).to.be.reverted;
        });

        it('Should revert if the same address or Twitter handle is used twice', async () => {
          await expect(
            promiseFactory.createPromiseContract(
              'Test',
              IPFS_CID,
              ARWEAVE_ID,
              ENCRYPTED_PROOF,
              ['Bob', 'Alice'],
              ['bob', 'alice'],
              [deployer.address, deployer.address],
            ),
          ).to.be.reverted;

          await expect(
            promiseFactory.createPromiseContract(
              'Test',
              IPFS_CID,
              ARWEAVE_ID,
              ENCRYPTED_PROOF,
              ['Bob', 'Alice'],
              ['bob', 'bob'],
              [deployer.address, user.address],
            ),
          ).to.be.reverted;
        });

        it('Should revert if the promise name is more than 70 characters', async () => {
          const name = 'a'.repeat(71);
          await expect(
            promiseFactory.createPromiseContract(
              name,
              IPFS_CID,
              ARWEAVE_ID,
              ENCRYPTED_PROOF,
              PARTY_NAMES,
              PARTY_TWITTER,
              [deployer.address],
            ),
          ).to.be.reverted;
        });

        it('Should revert if any of the participant name is more than 30 characters', async () => {
          const partyNames = ['a'.repeat(31), 'b'.repeat(15)];
          await expect(
            promiseFactory.createPromiseContract(
              'Test',
              IPFS_CID,
              ARWEAVE_ID,
              ENCRYPTED_PROOF,
              partyNames,
              PARTY_TWITTER,
              [deployer.address],
            ),
          ).to.be.reverted;
        });

        it('Should not allow a user to create a promise without including their address', async () => {
          await expect(
            promiseFactory.createPromiseContract(
              'Test',
              IPFS_CID,
              ARWEAVE_ID,
              ENCRYPTED_PROOF,
              PARTY_NAMES,
              PARTY_TWITTER,
              [user.address],
            ),
          ).to.be.reverted;
        });

        it('Should create a new PromiseContract and create a mapping between the sender and the child contract addresses', async () => {
          const { txReceipt } = await createPromiseContract('Test 1', [
            deployer.address,
          ]);
          const promiseContractAddress = txReceipt.events[0].address;
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

          // Expected PromiseContract to equal PromiseFactory
        });

        it('Should emit a PromiseContractCreated event with the right arguments', async () => {
          const { tx, txReceipt } = await createPromiseContract('Test 2', [
            deployer.address,
          ]);
          const promiseContractAddress = txReceipt.events[0].address;

          expect(tx)
            .to.emit(promiseFactory, 'PromiseContractCreated')
            .withArgs(
              deployer.address,
              promiseContractAddress,
              'Test 2',
              IPFS_CID,
              ARWEAVE_ID,
              ENCRYPTED_PROOF,
              PARTY_NAMES,
              PARTY_TWITTER,
              [deployer.address],
            );
        });

        it('Should return the correct number of child contracts for a user', async () => {
          await createPromiseContract('Test 3', [deployer.address]);
          await createPromiseContract('Test 4', [deployer.address]);

          const promiseContractsLength = await promiseFactory.getPromiseContractCount(
            deployer.address,
          );
          // There were 2 PromiseContract created in the previous test
          // We would usually use a beforeEach hook but it's faster this way
          assert.equal(promiseContractsLength, 4);
        });
      });

      describe('addTwitterVerifiedUser', function() {
        it('Should not allow anyone other than the VerifyTwitter contract to add a verified Twitter user', async () => {
          await expect(
            promiseFactory.addTwitterVerifiedUser(deployer.address, 'username'),
          ).to.be.reverted;
        });

        it('Should not allow anyone else than the owner to call `setTwitterVerifier`', async () => {
          await expect(
            promiseFactory.connect(user).setTwitterVerifier(user.address),
          ).to.be.reverted;
        });

        // The rest of the tests are performed in ./VerifyTwitter.staging.test.js
      });

      describe('updateStorageStatus', function() {
        it('Should not allow anyone other than the VerifyStorage contract to update the storage status', async () => {
          const { txReceipt } = await createPromiseContract('Test 5', [
            deployer.address,
          ]);
          promiseContractAddress = txReceipt.events[0].address;
          promiseContract = await ethers.getContractAt(
            'PromiseContract',
            promiseContractAddress,
          );

          await expect(
            promiseFactory.updateStorageStatus(promiseContract.address, 1),
          ).to.be.reverted;
        });

        it('Should not allow anyone else than the owner to call `setStorageVerifier`', async () => {
          await expect(
            promiseFactory.connect(user).setStorageVerifier(user.address),
          ).to.be.reverted;
        });

        // The rest of the tests are performed in VerifyStorage.staging.test.js
      });

      describe('addParticipant', function() {
        before(async () => {
          const { txReceipt } = await createPromiseContract('Test 6', [
            deployer.address,
          ]);
          promiseContractAddress = txReceipt.events[0].address;
          promiseContract = await ethers.getContractAt(
            'PromiseContract',
            promiseContractAddress,
            deployer,
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
          ).to.be.reverted;
        });

        it('Should revert if the participant is already in the PromiseContract', async () => {
          await expect(
            promiseFactory.addParticipant(
              promiseContract.address,
              'name',
              'handle',
              deployer.address,
            ),
          ).to.be.reverted;
        });

        it('Should revert if the participant name is more than 30 characters', async () => {
          await expect(
            promiseFactory.addParticipant(
              promiseContract.address,
              'a'.repeat(31),
              'handle',
              user.address,
            ),
          ).to.be.reverted;
        });

        it('Should add a participant to the PromiseContract, disapprove the promise for all of them, and emit an event', async () => {
          // Setup a listener for the ParticipantCreated in the PromiseContract
          await new Promise(async (resolve, reject) => {
            console.log('Waiting for the participant to be added...');

            promiseContract.once('ParticipantCreated', async () => {
              console.log('Participant added!');
              try {
                const participant = await promiseContract.getParticipant(
                  user.address,
                );

                // Now that the participant has indeed been added, we can check the values
                assert.equal(participant.participantName, 'Charlie');
                assert.equal(participant.participantTwitterHandle, 'charlie');
                assert.equal(participant.participantAddress, user.address);

                // and verify that the promise has been disapproved for all participants
                assert.equal(
                  await promiseContract.getIsPromiseApproved(deployer.address),
                  false,
                );
                resolve();
              } catch (err) {
                reject(err);
              }
            });

            // Approve the promise and add the participant
            await promiseContract.approvePromise();
            const tx = await promiseFactory.addParticipant(
              promiseContract.address,
              'Charlie',
              'charlie',
              user.address,
            );

            assert.equal(
              await promiseContract.getIsPromiseApproved(deployer.address),
              true,
            );
            expect(tx)
              .to.emit(promiseFactory, 'ParticipantAdded')
              .withArgs(
                promiseContract.address,
                'Charlie',
                'charlie',
                user.address,
              );
          });
        });
      });
    });
