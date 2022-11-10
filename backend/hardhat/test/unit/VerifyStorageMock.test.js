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
  : describe('VerifyStorageMock unit tests', function() {
      let deployer;
      let user;
      let fakePromiseFactory;
      let verifyStorageMockDeploy;
      let verifyStorageMock;
      let promiseFactory;
      let promiseContract;

      const createPromiseContract = async () => {
        const tx = await promiseFactory.createPromiseContract(
          'Test promise',
          IPFS_CID,
          ARWEAVE_ID,
          ['Bob', 'Alice'],
          ['@bob', '@alice'],
          [deployer.address, user.address],
          ENCRYPTED_PROOF,
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
        verifyStorageMockDeploy = await ethers.getContract('VerifyStorageMock');
        verifyStorageMock = verifyStorageMockDeploy.connect(deployer);
        promiseFactory = await ethers.getContract('PromiseFactory', deployer);
        await promiseFactory.setStorageVerifier(verifyStorageMock.address);

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
          const promiseFactoryAddress = await verifyStorageMock.getPromiseFactoryContract();
          // ChainlinkClientTestHelper provides these 2 functions for testing
          const linkAddress = await verifyStorageMock.publicChainlinkToken();
          const oracleAddress = await verifyStorageMock.publicOracleAddress();
          // It is a constant not initialized in the constructor, so not really necessary to test
          const oraclePayment = await verifyStorageMock.getOraclePayment();

          assert.equal(promiseFactoryAddress, promiseFactory.address);
          assert.equal(linkAddress, LINK_TOKEN_MUMBAI);
          assert.equal(oracleAddress, OPERATOR_MUMBAI);
          assert.equal(oraclePayment.toString(), ORACLE_PAYMENT);

          // Check that ConfirmedOwner is initialized correctly
          const tx = await verifyStorageMock.modifierOnlyOwner();
          const txReceipt = await tx.wait(1);

          assert.equal(txReceipt.events[0].eventSignature, 'Here()');
        });
      });

      describe('requestStorageStatusUpdate', function() {
        it('Should revert if not called by the PromiseFactory', async () => {
          await expect(
            verifyStorageMock.requestVerification(
              fakePromiseAddress,
              deployer.address,
              IPFS_CID,
              ARWEAVE_ID,
              ENCRYPTED_PROOF,
            ),
          ).to.be.revertedWith('VerifyStorage__NOT_FACTORY()');
        });

        it('Should emit an event with the correct requestId and the promise address', async () => {
          const fakePromiseAddress =
            '0x1234567890123456789012345678901234567890';
          await expect(
            verifyStorageMock.requestVerification(
              fakePromiseAddress,
              deployer.address,
              IPFS_CID,
              ARWEAVE_ID,
              ENCRYPTED_PROOF,
            ),
          )
            .to.emit(verifyStorageMock, 'StorageStatusUpdateRequested')
            .withArgs(REQUEST_ID, fakePromiseAddress);

          // Just to test that the data is passed correctly
          await expect(
            verifyStorageMock.requestVerification(
              fakePromiseAddress,
              deployer.address,
              IPFS_CID,
              ARWEAVE_ID,
              ENCRYPTED_PROOF,
            ),
          )
            .to.emit(
              verifyStorageMock,
              'StorageStatusUpdateRequestedVerifyArguments',
            )
            .withArgs(
              fakePromiseAddress,
              deployer.address,
              IPFS_CID,
              ARWEAVE_ID,
              ENCRYPTED_PROOF,
            );
        });
      });

      // In this test, the deployer is the one creating the requests, see:
      // publicAddExternalRequest(msg.sender, requestId)
      // This line, only present in the mock contract, associates the request id to the deployer address
      // Normally, it would be associated with the oracle (operator) address,
      // which prevents anyone else (including the deployer) from calling fulfillVerification
      describe('fulfillVerification', function() {
        beforeEach(async () => {
          // Add a new request to the mapping
          await verifyTwitterMock.requestVerification(TEST_USERNAME);
        });
        it('Should revert if called by anyone other than the oracle', async () => {
          verifyTwitterMock = verifyTwitterMock.connect(user);

          // Try to fulfill the request
          await expect(
            verifyTwitterMock.fulfillVerification(
              REQUEST_ID,
              TEST_USERNAME,
              true,
              user.address,
            ),
          ).to.be.revertedWith('Source must be the oracle of the request');
        });

        it('Should add a verified user to the mapping in PromiseFactory and emit an event', async () => {
          await expect(
            verifyTwitterMock.fulfillVerification(
              REQUEST_ID,
              TEST_USERNAME,
              true,
              user.address,
            ),
          )
            .to.emit(verifyTwitterMock, 'VerificationSuccessful')
            .withArgs(REQUEST_ID, TEST_USERNAME, user.address, true);

          const isVerifiedHandle = await promiseFactory.getTwitterVerifiedHandle(
            user.address,
          );

          assert.equal(isVerifiedHandle, TEST_USERNAME);
        });

        it('Should not add a user who failed verification to the mapping in PromiseFactory and emit a failed event', async () => {
          await expect(
            verifyTwitterMock.fulfillVerification(
              REQUEST_ID,
              TEST_USERNAME,
              false,
              user.address,
            ),
          )
            .to.emit(verifyTwitterMock, 'VerificationFailed')
            .withArgs(REQUEST_ID, TEST_USERNAME);

          const isVerifiedHandle = await promiseFactory.getTwitterVerifiedHandle(
            user.address,
          );

          assert.equal(isVerifiedHandle, '');
        });

        it('Should allow the same user to request verification again', async () => {
          await verifyTwitterMock.fulfillVerification(
            REQUEST_ID,
            TEST_USERNAME,
            true,
            user.address,
          );

          // Request verification again
          const tx = await verifyTwitterMock.requestVerification(
            TEST_USERNAME_2,
          );
          const txReceipt = await tx.wait(1);

          assert.equal(txReceipt.events[0].args.requestId, REQUEST_ID);

          // Fulfill the request again
          await verifyTwitterMock.fulfillVerification(
            REQUEST_ID,
            TEST_USERNAME_2,
            true,
            user.address,
          );

          const isVerifiedHandle = await promiseFactory.getTwitterVerifiedHandle(
            user.address,
          );

          assert.equal(isVerifiedHandle[0], TEST_USERNAME);
          assert.equal(isVerifiedHandle[1], TEST_USERNAME_2);
        });

        it('Should allow the user to verify the same username again but not add it again to the mapping', async () => {
          await verifyTwitterMock.fulfillVerification(
            REQUEST_ID,
            TEST_USERNAME,
            true,
            user.address,
          );

          // Request verification again
          const tx = await verifyTwitterMock.requestVerification(TEST_USERNAME);
          const txReceipt = await tx.wait(1);

          assert.equal(txReceipt.events[0].args.requestId, REQUEST_ID);

          // Fulfill the request again
          await verifyTwitterMock.fulfillVerification(
            REQUEST_ID,
            TEST_USERNAME,
            true,
            user.address,
          );

          const isVerifiedHandle = await promiseFactory.getTwitterVerifiedHandle(
            user.address,
          );

          assert.equal(isVerifiedHandle[0], TEST_USERNAME);
          assert.equal(isVerifiedHandle[1], undefined);
        });
      });

      describe('utils', function() {
        it('addressToString', async () => {
          const address = '0x0000000000000000000000000000000000000000';
          const addressString = await verifyTwitterMock.testAddressToString(
            address,
          );

          assert.equal(
            addressString,
            '0x0000000000000000000000000000000000000000',
          );
        });
      });
    });
