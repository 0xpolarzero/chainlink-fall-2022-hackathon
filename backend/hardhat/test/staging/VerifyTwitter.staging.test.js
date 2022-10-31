const { assert, expect } = require('chai');
const {
  developmentChains,
  ORACLE_PAYMENT,
  LINK_TOKEN_MUMBAI,
} = require('../../helper-hardhat-config');
const { deployments, network, ethers } = require('hardhat');

const VERIFIED_USERNAME = 'testAcc09617400';
const UNVERIFIED_USERNAME = 'TwitterDev';
const REQUIRED_LINK_AMOUNT_FOR_TESTS = ethers.utils.parseEther('0.2');

developmentChains.includes(network.name)
  ? describe.skip
  : describe('VerifyTwitter staging tests', function() {
      let deployer;
      let user;
      let verifyTwitterDeploy;
      let verifyTwitter;
      let promiseFactory;

      before(async () => {
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
        const linkBalance = await verifyTwitter.getLinkBalance();

        if (linkBalance < REQUIRED_LINK_AMOUNT_FOR_TESTS) {
          console.log('Funding VerifyTwitter contract with LINK...');
          const linkToken = await ethers.getContractAt(
            '@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol:LinkTokenInterface',
            LINK_TOKEN_MUMBAI,
            deployer,
          );
          await linkToken.transfer(
            verifyTwitter.address,
            REQUIRED_LINK_AMOUNT_FOR_TESTS,
          );
          console.log('Waiting for VerifyTwitter contract to receive LINK...');

          // Wait for the VerifyTwitter contract to receive the LINK
          let balance = await verifyTwitter.getLinkBalance();
          while (balance < REQUIRED_LINK_AMOUNT_FOR_TESTS) {
            console.log('Waiting...');
            await new Promise((r) => setTimeout(r, 5000));
            balance = await verifyTwitter.getLinkBalance();
          }
          console.log('Funding complete.');
        }
      });

      describe('constructor', function() {
        it('Should initialize the contract correctly', async () => {
          const promiseFactoryAddress = await verifyTwitter.getPromiseFactoryContract();
          // It is a constant not initialized in the constructor, so not really necessary to test
          const oraclePayment = await verifyTwitter.getOraclePayment();

          assert.equal(promiseFactoryAddress, promiseFactory.address);
          assert.equal(oraclePayment.toString(), ORACLE_PAYMENT);
        });
      });

      describe('requestVerification', function() {
        it('Should emit an event with the username', async () => {
          const tx = await verifyTwitter.requestVerification(
            UNVERIFIED_USERNAME,
          );
          const txReceipt = await tx.wait(1);
          const event = txReceipt.events[4];

          assert.equal(event.event, 'VerificationRequested');
          assert.equal(event.args.username, UNVERIFIED_USERNAME);
        });
      });

      describe('fulfillVerification', function() {
        it('Should revert if called by anyone other than the oracle', async () => {
          // Request a verification without waiting for the oracle to fulfill it
          const tx = await verifyTwitter.requestVerification(
            UNVERIFIED_USERNAME,
          );
          const txReceipt = await tx.wait(1);
          const requestId = txReceipt.events[4].args.requestId;

          // Try to fulfill the verification before the oracle does
          await expect(
            verifyTwitter.fulfillVerification(
              requestId,
              UNVERIFIED_USERNAME,
              true,
              deployer.address,
            ),
          ).to.be.revertedWith('Source must be the oracle of the request');
        });

        it('Should emit a failed event and not add the user to the verified users mapping', async () => {
          // Setup a listener for the VerificationFailed event
          console.log('Setting up Listener...');
          await new Promise(async (resolve, reject) => {
            console.log('Waiting for the oracle to fulfill the request...');

            verifyTwitter.once('VerificationFailed', async (username) => {
              console.log('VerificationFailed event fired.');
              try {
                // Check the mapping in PromiseFactory
                const isVerifiedHandle = await promiseFactory.getTwitterVerifiedHandle(
                  deployer.address,
                );

                const usernameString = ethers.utils.parseBytes32String(
                  username,
                );
                assert.equal(usernameString, UNVERIFIED_USERNAME);
                assert.equal(isVerifiedHandle, '');

                resolve();
              } catch (error) {
                console.log(error);
                reject(error);
              }
            });

            // Request a verification
            console.log('Requesting a verification...');
            const tx = await verifyTwitter.requestVerification(
              UNVERIFIED_USERNAME,
            );
            await tx.wait(1);
            console.log('Verification requested.');
          });
        });

        it.only('Should emit a successful event and add the user to the verified users mapping', async () => {
          // Setup a listener for the VerificationSuccessful event
          console.log('Setting up Listener...');
          await new Promise(async (resolve, reject) => {
            console.log('Waiting for the oracle to fulfill the request...');

            verifyTwitter.once('VerificationSuccessful', async (username) => {
              console.log('VerificationSuccessful event fired.');
              try {
                // Check the mapping in PromiseFactory
                const isVerifiedHandle = await promiseFactory.getTwitterVerifiedHandle(
                  deployer.address,
                );

                const usernameString = ethers.utils.parseBytes32String(
                  username,
                );
                assert.equal(usernameString, VERIFIED_USERNAME);
                assert.equal(isVerifiedHandle[0], VERIFIED_USERNAME);

                resolve();
              } catch (error) {
                console.log(error);
                reject(error);
              }
            });

            // Request a verification
            console.log('Requesting a verification...');
            const tx = await verifyTwitter.requestVerification(
              VERIFIED_USERNAME,
            );
            await tx.wait(1);
            console.log('Verification requested.');
          });
        });

        // Event failed and not add
        // Event successful and add
        // Allow to add again
        // Reverts if same username
      });
    });
