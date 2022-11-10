const { assert, expect } = require('chai');
const {
  developmentChains,
  ORACLE_PAYMENT,
  LINK_TOKEN_MUMBAI,
} = require('../../helper-hardhat-config');
const { encryptAES256 } = require('../utils/encryptAES256');
const { deployments, network, ethers } = require('hardhat');

const REQUIRED_LINK_AMOUNT_FOR_TESTS = ethers.utils.parseEther('0.1');
const IPFS_CID = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';
const ARWEAVE_ID = '1JXtGzqZtJxG0yUvJGmZwWqjLbIuTtqXgKXgjXgqXgq';

developmentChains.includes(network.name)
  ? describe.skip
  : describe.only('VerifyStorage staging tests', function() {
      let deployer;
      let user;
      let verifyStorageDeploy;
      let verifyStorage;
      let promiseFactory;
      let encryptedProofValid;
      let encryptedProofValidNoArweave;
      let encryptedProofInvalid;

      const createPromiseContract = async (
        encryptedProof,
        bobAddress,
        aliceAddress,
      ) => {
        const tx = await promiseFactory.createPromiseContract(
          'Test promise',
          IPFS_CID,
          ARWEAVE_ID,
          encryptedProof,
          ['Bob', 'Alice'],
          ['@bob', '@alice'],
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
          deployer.address + IPFS_CID + ARWEAVE_ID,
        );
        encryptedProofValidNoArweave = encryptAES256(
          deployer.address + IPFS_CID + '',
        );
        encryptedProofInvalid = encryptAES256(
          deployer.address + 'wrongCid' + 'wrongId',
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

      describe.only('requestStorageStatusUpdate', function() {
        // All the requests are made by the PromiseFactory contract
        // during the promise creation process
        it.only('Should revert if called by anyone else than the PromiseFactory contract', async () => {
          console.log('Creating promise contract...');
          const { txReceipt } = await createPromiseContract(
            encryptedProofValid,
            deployer.address,
            user.address,
          );
          const promiseContractAddress = txReceipt.events[1].address;

          // TODO WHY NOT REVERTED WITH RIGHT REVERT MESSAGE?
          await expect(
            verifyStorage.requestStorageStatusUpdate(
              promiseContractAddress,
              deployer.address,
              IPFS_CID,
              ARWEAVE_ID,
              encryptedProofValid,
            ),
          ).to.be.revertedWith('VerifyStorage__NOT_FACTORY()');
        });

        it('Should emit an event with the promiseAddress when creating the promise', async () => {
          console.log('Creating promise contract...');
          const { txReceipt } = await createPromiseContract(
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
          const requestId = await new Promise((resolve) => {
            verifyStorage.on(
              'StorageStatusUpdateRequested',
              (promiseAddress, requestId) => {
                // Once the event is emitted, try to fulfill the request
                tryToFulfillRequest(requestId, promiseAddress, resolve);
              },
            );
          });

          // Create a promise contract that will trigger a request
          console.log('Creating promise contract...');
          await createPromiseContract(
            encryptedProofValid,
            deployer.address,
            user.address,
          );

          const tryToFulfillRequest = async (
            requestId,
            promiseAddress,
            resolve,
          ) => {
            // Try to fulfill the request
            await expect(
              verifyStorage.fulfillStorageStatusUpdate(
                requestId,
                promiseAddress,
                3,
              ),
            ).to.be.revertedWith('VerifyStorage__NOT_ORACLE');
            resolve(requestId);
          };
        });

        it('Should emit a failed event and not add the user to the verified users mapping', async () => {
          const verifications = async () => {
            // Check the mapping in PromiseFactory
            const isVerifiedHandle = await promiseFactory.getTwitterVerifiedHandle(
              deployer.address,
            );

            assert.equal(isVerifiedHandle, '');
          };

          await requestAVerification(
            verifyTwitter,
            UNVERIFIED_USERNAME,
            'VerificationFailed',
            verifications,
          );
        });

        it('Should emit a successful event and add the user to the verified users mapping', async () => {
          const verifications = async () => {
            const isVerifiedHandle = await promiseFactory.getTwitterVerifiedHandle(
              deployer.address,
            );

            assert.equal(isVerifiedHandle[0], VERIFIED_USERNAME);
          };

          await requestAVerification(
            verifyTwitter,
            VERIFIED_USERNAME,
            'VerificationSuccessful',
            verifications,
          );
        });

        it('Should allow a user to verify an additional username with their address', async () => {
          const verifications = async () => {
            const isVerifiedHandle = await promiseFactory.getTwitterVerifiedHandle(
              deployer.address,
            );

            assert.equal(isVerifiedHandle[1], VERIFIED_USERNAME_2);
            assert.equal(isVerifiedHandle.length, 2);
          };

          await requestAVerification(
            verifyTwitter,
            VERIFIED_USERNAME_2,
            'VerificationSuccessful',
            verifications,
          );
        });

        it("Should not add the verified account if it's already been verified for this address", async () => {
          // Setup a listener to grab the failure in adding a new verified user in PromiseFactory
          // It will revert the transaction after emitting a TwitterAddVerifiedFailed
          const verifications = async () => {
            const isVerifiedHandle = await promiseFactory.getTwitterVerifiedHandle(
              deployer.address,
            );

            // Should be left untouched
            assert.equal(isVerifiedHandle[0], VERIFIED_USERNAME);
            assert.equal(isVerifiedHandle[1], VERIFIED_USERNAME_2);
            assert.equal(isVerifiedHandle.length, 2);
          };

          // This time
          await requestAVerification(
            verifyTwitter,
            VERIFIED_USERNAME,
            'VerificationSuccessful',
            verifications,
          );
        });
      });

      const requestAVerification = async (
        eventContract,
        username,
        event,
        verificationsToPerform,
      ) => {
        // Setup a listener for the event
        console.log('Setting up Listener...');
        await new Promise(async (resolve, reject) => {
          console.log('Waiting for the oracle to fulfill the request...');

          eventContract.once(event, async () => {
            console.log(`${event} event fired.`);
            try {
              await verificationsToPerform();
              resolve();
            } catch (err) {
              console.log(err);
              reject(err);
            }
          });

          // Request a verification
          console.log('Requesting a verification...');
          const tx = await verifyTwitter.requestVerification(username);
          await tx.wait(1);
          console.log('Verification requested.');
        });
      };
    });
