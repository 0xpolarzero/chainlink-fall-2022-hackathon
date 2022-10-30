const { assert, expect } = require('chai');
const {
  developmentChains,
  ORACLE_PAYMENT,
  LINK_TOKEN_MUMBAI,
  OPERATOR,
} = require('../../helper-hardhat-config');
const { deployments, network, ethers } = require('hardhat');

const VERIFIED_USERNAME = 'testAcc09617400';
const UNVERIFIED_USERNAME = 'TwitterDev';

developmentChains.includes(network.name)
  ? describe.skip
  : describe('VerifyTwitter staging tests', function() {
      let deployer;
      let user;
      let verifyTwitterDeploy;
      let verifyTwitter;
      let promiseFactory;
      let expectedRequestId;

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        user = accounts[1];

        console.log('Deploying contracts...');
        await deployments.fixture('main');
        console.log('Deployed contracts.');

        verifyTwitterDeploy = await ethers.getContract('VerifyTwitter');
        verifyTwitter = verifyTwitterDeploy.connect(deployer);
        promiseFactory = await ethers.getContract('PromiseFactory', deployer);

        // Set the allowed verifier (VerifyTwitter address) if needed
        console.log('Setting allowed verifier...');
        const isVerifier = await promiseFactory.getVerifier();
        if (isVerifier !== verifyTwitter.address) {
          await promiseFactory.setVerifier(verifyTwitter.address);
        }
        console.log('Allowed verifier set.');

        // Fund the VerifyTwitter contract with LINK if the balance is < 0.2 LINK
        console.log('Funding VerifyTwitter contract with LINK...');
        const linkBalance = await verifyTwitter.getLinkBalance();
        if (linkBalance < ethers.utils.parseEther('0.2')) {
          const linkToken = await ethers.getContractAt(
            'LinkTokenInterface',
            LINK_TOKEN_MUMBAI,
          );
          await linkToken
            .connect(deployer)
            .transfer(verifyTwitter.address, ethers.utils.parseEther('0.2'));
        }
        console.log('Funding complete.');
      });

      describe('constructor', function() {
        it('Should initialize the contract correctly', async () => {
          const promiseFactoryAddress = await verifyTwitter.getPromiseFactoryContract();
          const linkTokenAddress = await verifyTwitter.chainlinkTokenAddress();
          const oracleAddress = await verifyTwitter.chainlinkOracleAddress();
          // It is a constant not initialized in the constructor, so not really necessary to test
          const oraclePayment = await verifyTwitter.getOraclePayment();

          assert.equal(promiseFactoryAddress, promiseFactory.address);
          assert.equal(linkTokenAddress, LINK_TOKEN_MUMBAI);
          assert.equal(oracleAddress, OPERATOR);
          assert.equal(oraclePayment.toString(), ORACLE_PAYMENT);
        });
      });

      describe('requestVerification', function() {
        it('Should emit an event with the username', async () => {
          const tx = await verifyTwitter.requestVerification(
            UNVERIFIED_USERNAME,
          );
          const txReceipt = await tx.wait(1);
          const event = txReceipt.events[0];

          assert.equal(event.event, 'VerificationRequested');
          assert.equal(event.args.username, UNVERIFIED_USERNAME);
        });
      });
      describe('fulfillVerification', function() {
        it('Should revert if called by anyone other than the oracle', async () => {
          verifyTwitter = verifyTwitterDeploy.connect(user);

          await expect(
            verifyTwitter.fulfillVerification(
              REQUEST_ID,
              UNVERIFIED_USERNAME,
              true,
              user.address,
            ),
          ).to.be.revertedWith('Source must be the oracle of the request');
        });

        describe('Verification failed - No signature in the tweet', function() {
          it('Should emit a failed event and not add the user to the verified users mapping', async () => {
            // Setup a listener for the VerificationFailed event
            await new Promise(async (resolve, reject) => {
              verifyTwitter.once(
                'VerificationFailed',
                async (requestId, username) => {
                  console.log('VerificationFailed event emitted');
                  assert.equal(username, UNVERIFIED_USERNAME);
                  assert.equal(requestId, expectedRequestId);
                  resolve();
                },
              );
            });

            const tx = await verifyTwitter.requestVerification(
              UNVERIFIED_USERNAME,
            );
            const txReceipt = await tx.wait(1);
            const event = txReceipt.events[0];
            expectedRequestId = event.args.requestId;
          });
        });

        // Event failed and not add
        // Event successful and add
        // Allow to add again
        // Reverts if same username
      });
    });
