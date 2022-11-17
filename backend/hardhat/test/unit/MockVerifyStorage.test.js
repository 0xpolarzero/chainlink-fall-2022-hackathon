const { assert, expect } = require('chai');
const {
  developmentChains,
  LINK_TOKEN_MUMBAI,
  OPERATOR_MUMBAI,
  ORACLE_PAYMENT,
} = require('../../helper-hardhat-config');
const { deployments, network, ethers } = require('hardhat');

const REQUEST_ID = ethers.utils.formatBytes32String('0x1234567890');
const IPFS_CID = 'bafybeieyah7pyu3mrreajpt4yp7fxzkjzhpir6wu4c6ofg42o57htgmfeq';
const ARWEAVE_ID = '35wFhCNgA8upsCl-jNQvdXOKCXzO8vx1OeEspMcl3jY';
const ENCRYPTED_PROOF = '01234567890';

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('MockVerifyStorage unit tests', function() {
      let deployer;
      let user;
      let fakePromiseFactory;
      let mockVerifyStorageDeploy;
      let mockVerifyStorage;
      let mockPromiseFactory;
      let promiseContract;

      const createPromiseContract = async () => {
        const tx = await mockPromiseFactory.createPromiseContract(
          'Test promise',
          IPFS_CID,
          ARWEAVE_ID,
          ENCRYPTED_PROOF,
          ['Bob', 'Alice'],
          ['bob', 'alice'],
          [deployer.address, user.address],
        );
        const txReceipt = await tx.wait(1);

        return { tx, txReceipt };
      };

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        user = accounts[1];
        fakePromiseFactory = accounts[2];

        await deployments.fixture(['main', 'mocks']);
        mockVerifyStorageDeploy = await ethers.getContract('MockVerifyStorage');
        mockVerifyStorage = mockVerifyStorageDeploy.connect(deployer);
        mockPromiseFactory = await ethers.getContract(
          'MockPromiseFactory',
          deployer,
        );
        await mockPromiseFactory.setStorageVerifier(mockVerifyStorage.address);

        // Create a promise and grab its contract
        const { txReceipt } = await createPromiseContract();
        const promiseContractAddress = txReceipt.events[1].address;
        promiseContract = await ethers.getContractAt(
          'PromiseContract',
          promiseContractAddress,
        );
      });

      describe('constructor', function() {
        it('Should initialize the contract correctly', async () => {
          const mockPromiseFactoryAddress = await mockVerifyStorage.getPromiseFactoryContract();
          // ChainlinkClientTestHelper provides these 2 functions for testing
          const linkAddress = await mockVerifyStorage.publicChainlinkToken();
          const oracleAddress = await mockVerifyStorage.publicOracleAddress();
          // It is a constant not initialized in the constructor, so not really necessary to test
          const oraclePayment = await mockVerifyStorage.getOraclePayment();

          assert.equal(mockPromiseFactoryAddress, mockPromiseFactory.address);
          assert.equal(linkAddress, LINK_TOKEN_MUMBAI);
          assert.equal(oracleAddress, OPERATOR_MUMBAI);
          assert.equal(oraclePayment.toString(), ORACLE_PAYMENT);

          // Check that ConfirmedOwner is initialized correctly
          const tx = await mockVerifyStorage.modifierOnlyOwner();
          const txReceipt = await tx.wait(1);

          assert.equal(txReceipt.events[0].eventSignature, 'Here()');
        });
      });

      describe('requestStorageStatusUpdate', function() {
        it('Should revert if not called by the PromiseFactory', async () => {
          await expect(
            mockVerifyStorage.requestStorageStatusUpdate(
              promiseContract.address,
              deployer.address,
              IPFS_CID,
              ARWEAVE_ID,
              ENCRYPTED_PROOF,
            ),
          ).to.be.revertedWith('VerifyStorage__NOT_FACTORY()');
        });

        it('Should emit an event with the correct requestId and the promise address', async () => {
          await expect(
            mockVerifyStorage
              .connect(fakePromiseFactory)
              .requestStorageStatusUpdate(
                promiseContract.address,
                deployer.address,
                IPFS_CID,
                ARWEAVE_ID,
                ENCRYPTED_PROOF,
              ),
          )
            .to.emit(mockVerifyStorage, 'StorageStatusUpdateRequested')
            .withArgs(REQUEST_ID, promiseContract.address);
        });

        it('Should pass the data correctly', async () => {
          // Just to test that the data is passed correctly
          await expect(
            mockVerifyStorage
              .connect(fakePromiseFactory)
              .requestStorageStatusUpdate(
                promiseContract.address,
                deployer.address,
                IPFS_CID,
                ARWEAVE_ID,
                ENCRYPTED_PROOF,
              ),
          )
            .to.emit(
              mockVerifyStorage,
              'StorageStatusUpdateRequestedVerifyArguments',
            )
            .withArgs(
              promiseContract.address,
              deployer.address,
              IPFS_CID,
              ARWEAVE_ID,
              ENCRYPTED_PROOF,
            );
        });
      });

      // In this test, the PromiseFactory is the one creating the requests, see:
      // publicAddExternalRequest(msg.sender, requestId)
      // This line, only present in the mock contract, associates the request id to the deployer address
      // Normally, it would be associated with the oracle (operator) address,
      // which prevents anyone else (including the PromiseFactory) from calling this function
      describe('fulfillStorageStatusUpdate', function() {
        beforeEach(async () => {
          // Add a new request to the mapping
          await mockVerifyStorage
            .connect(fakePromiseFactory)
            .requestStorageStatusUpdate(
              promiseContract.address,
              deployer.address,
              IPFS_CID,
              ARWEAVE_ID,
              ENCRYPTED_PROOF,
            );
        });

        it('Should revert if called by anyone other than the oracle', async () => {
          // Try to fulfill the request
          await expect(
            mockVerifyStorage
              .connect(deployer)
              .fulfillStorageStatusUpdate(
                REQUEST_ID,
                promiseContract.address,
                '1',
              ),
          ).to.be.revertedWith('Source must be the oracle of the request');
        });

        it('Should update the storageStatus in the promise and emit an event', async () => {
          const possibleStorageStatus = [1, 2, 3];

          // Initial storageStatus should be 0
          expect(await promiseContract.getStorageStatus()).to.equal(0);

          // Test it for each storageStatus value
          for (const status of possibleStorageStatus) {
            await expect(
              mockVerifyStorage
                .connect(fakePromiseFactory)
                .fulfillStorageStatusUpdate(
                  REQUEST_ID,
                  promiseContract.address,
                  status,
                ),
            )
              .to.emit(mockVerifyStorage, 'StorageStatusUpdateSuccessful')
              .withArgs(REQUEST_ID, promiseContract.address, status);

            const storageStatus = await promiseContract.getStorageStatus();
            assert.equal(storageStatus, status);

            // Send a new request for the next one
            await mockVerifyStorage
              .connect(fakePromiseFactory)
              .requestStorageStatusUpdate(
                promiseContract.address,
                deployer.address,
                IPFS_CID,
                ARWEAVE_ID,
                ENCRYPTED_PROOF,
              );
          }
        });

        it('Should not be able to update with a non-existent storageStatus (< 1 or > 3)', async () => {
          await expect(
            mockVerifyStorage
              .connect(fakePromiseFactory)
              .fulfillStorageStatusUpdate(
                REQUEST_ID,
                promiseContract.address,
                4,
              ),
          ).to.be.revertedWith(
            'PromiseContract__updateStorageStatus__INVALID_STATUS()',
          );
        });
      });
    });
