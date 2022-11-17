const { assert, expect } = require('chai');
const {
  developmentChains,
  ORACLE_PAYMENT,
  LINK_TOKEN_MUMBAI,
} = require('../../helper-hardhat-config');
const { encryptAES256 } = require('../utils/encryptAES256');
const { deployments, network, ethers } = require('hardhat');

const REQUIRED_LINK_AMOUNT_FOR_TESTS = ethers.utils.parseEther('0.5');
const IPFS_CID = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';
const ARWEAVE_ID = '1JXtGzqZtJxG0yUvJGmZwWqjLbIuTtqXgKXgjXgqXgq';

developmentChains.includes(network.name)
  ? describe.skip
  : describe('VerifyStorage staging tests', function() {
      let deployer;
      let user;
      let verifyStorageDeploy;
      let verifyStorage;
      let promiseFactory;
      let encryptedProofValid;
      let encryptedProofValidNoArweave;
      let encryptedProofInvalid;

      const createPromiseContract = async (
        ipfsCid,
        arweaveId,
        encryptedProof,
        bobAddress,
        aliceAddress,
      ) => {
        const tx = await promiseFactory.createPromiseContract(
          'Test promise',
          ipfsCid,
          arweaveId,
          encryptedProof,
          ['Bob', 'Alice'],
          ['bob', 'alice'],
          [bobAddress, aliceAddress],
        );
        const txReceipt = await tx.wait(1);

        return { tx, txReceipt };
      };

      before(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        user = accounts[1];

        console.log('Deploying contracts...');
        await deployments.fixture(['promise-factory', 'verify-storage']);
        console.log('Deployed contracts.');

        verifyStorageDeploy = await ethers.getContract('VerifyStorage');
        verifyStorage = verifyStorageDeploy.connect(deployer);
        promiseFactory = await ethers.getContract('PromiseFactory', deployer);

        // Set the allowed verifier (VerifyStorage address) if needed
        console.log('Setting allowed verifier...');
        const isVerifier = await promiseFactory.getStorageVerifier();
        if (isVerifier !== verifyStorage.address) {
          await promiseFactory.setStorageVerifier(verifyStorage.address);
        }
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

        // Setup a few encrypted proofs for different scenarios
        encryptedProofValid = encryptAES256(
          deployer.address,
          IPFS_CID,
          ARWEAVE_ID,
        );
        encryptedProofValidNoArweave = encryptAES256(
          deployer.address,
          IPFS_CID,
          '',
        );
        encryptedProofInvalid = encryptAES256(
          deployer.address,
          'wrongCid',
          'wrongId',
        );
      });

      describe('constructor', function() {
        it('Should initialize the contract correctly', async () => {
          const promiseFactoryAddress = await verifyStorage.getPromiseFactoryContract();
          // It is a constant not initialized in the constructor, so not really necessary to test
          const oraclePayment = await verifyStorage.getOraclePayment();

          assert.equal(promiseFactoryAddress, promiseFactory.address);
          assert.equal(oraclePayment.toString(), ORACLE_PAYMENT);
        });
      });

      describe('requestStorageStatusUpdate', function() {
        // All the requests are made by the PromiseFactory contract
        // during the promise creation process
        it('Should revert if called by anyone else than the PromiseFactory contract', async () => {
          await expect(
            verifyStorage.requestStorageStatusUpdate(
              '0x0000000000000000000000000000000000000000',
              deployer.address,
              IPFS_CID,
              ARWEAVE_ID,
              encryptedProofValid,
            ),
          ).to.be.reverted;
        });

        it('Should emit an event with the promiseAddress when creating the promise', async () => {
          console.log('Creating promise contract...');
          const { txReceipt } = await createPromiseContract(
            IPFS_CID,
            ARWEAVE_ID,
            encryptedProofValid,
            deployer.address,
            user.address,
          );
          // The event should be emitted in the promise creation tx
          const promiseContractAddress = txReceipt.events[1].address;
          const event = txReceipt.events.find(
            (e) => e.event === 'StorageStatusUpdateRequested',
          );

          assert.equal(event.args.promiseContract, promiseContractAddress);
        });
      });

      describe('fulfillStorageStatusUpdate', function() {
        it('Should revert if called by anyone other than the oracle', async () => {
          // Setup a listener in the VerifyStorage contract to grab the request ID
          console.log(
            'Setting up listener for the StorageStatusUpdateRequested event...',
          );
          await new Promise(async (resolve, reject) => {
            console.log('Waiting for the oracle to fulfill the request...');
            verifyStorage.once(
              'StorageStatusUpdateRequested',
              async (requestId, promiseAddress) => {
                console.log('StorageStatusUpdateRequested event fired.');
                // Once the event is emitted, try to fulfill the request
                try {
                  await expect(
                    verifyStorage.fulfillStorageStatusUpdate(
                      requestId,
                      promiseAddress,
                      3,
                    ),
                  ).to.be.revertedWith(
                    'Source must be the oracle of the request',
                  );
                  resolve();
                } catch (err) {
                  reject(err);
                }
              },
            );

            // Create a promise contract that will trigger a request
            console.log('Creating promise contract...');
            await createPromiseContract(
              IPFS_CID,
              ARWEAVE_ID,
              encryptedProofValid,
              deployer.address,
              user.address,
            );
          });
        });

        it('Should update the storageStatus with the correct status', async () => {
          // Setup each scenario
          const scenarios = [
            {
              name: 'Valid proof',
              ipfsCid: IPFS_CID,
              arweaveId: ARWEAVE_ID,
              encryptedProof: encryptedProofValid,
              expectedStatus: 3,
            },
            {
              name: 'Valid proof without Arweave ID',
              ipfsCid: IPFS_CID,
              arweaveId: '',
              encryptedProof: encryptedProofValidNoArweave,
              expectedStatus: 2,
            },
            {
              name: 'Invalid proof',
              ipfsCid: 'differentWrongCid',
              arweaveId: 'differentWrongId',
              encryptedProof: encryptedProofInvalid,
              expectedStatus: 1,
            },
          ];

          for (const scenario of scenarios) {
            console.log(`Testing scenario: ${scenario.name}`);

            console.log('Setting up listeners...');
            await new Promise(async (resolve, reject) => {
              console.log('Waiting for the oracle to fulfill the request...');

              console.log(
                'Setting up listener for the StorageStatusUpdateSuccessful event...',
              );
              // Setup a listener in the VerifyStorage contract for the StorageStatusUpdateSuccessful event
              verifyStorage.once(
                'StorageStatusUpdateSuccessful',
                async (requestId, promiseAddress, storageStatus) => {
                  console.log('StorageStatusUpdateSuccessful event fired.');
                  // Check the storage status in the event
                  try {
                    console.log(
                      storageStatus === scenario.expectedStatus
                        ? `${scenario.name} ✅`
                        : `${scenario.name} ❌`,
                    );
                    assert.equal(storageStatus, scenario.expectedStatus);
                    console.log('Done.');
                    // resolve();
                  } catch (err) {
                    reject(err);
                  }
                },
              );

              // Create a promise contract that will trigger a request
              console.log('Creating promise contract...');
              const { txReceipt } = await createPromiseContract(
                scenario.ipfsCid,
                scenario.arweaveId,
                scenario.encryptedProof,
                deployer.address,
                user.address,
              );
              const localPromiseContract = await ethers.getContractAt(
                'PromiseContract',
                txReceipt.events[1].address,
              );

              // Setup a listener to check the storage status only when
              // it has been updated (StorageStatusUpdateSuccessful event)
              // and hope it will be setup before the event is fired
              console.log(
                'Setting up listener for the StorageStatusUpdated event...',
              );
              // Once the verification has been done, this event will be emitted
              localPromiseContract.once(
                'PromiseStorageStatusUpdated',
                async () => {
                  console.log('PromiseStorageStatusUpdated event fired.');
                  try {
                    // Check the storage status in the promise contract
                    console.log(
                      'Checking storage status in the promise contract...',
                    );
                    const status = await localPromiseContract.getStorageStatus();
                    assert.equal(status.toString(), scenario.expectedStatus);
                    console.log('Done.');
                    resolve();
                  } catch (err) {
                    reject(err);
                  }
                },
              );
            });
          }
        });
      });
    });
