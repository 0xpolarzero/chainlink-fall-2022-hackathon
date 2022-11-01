const { assert, expect } = require('chai');
const {
  developmentChains,
  ORACLE_PAYMENT,
  LINK_TOKEN_MUMBAI,
} = require('../../helper-hardhat-config');
const { deployments, network, ethers } = require('hardhat');

const VERIFIED_USERNAME = 'testAcc09617400';
const VERIFIED_USERNAME_2 = 'testAcc09617401';
const UNVERIFIED_USERNAME = 'TwitterDev';
const REQUIRED_LINK_AMOUNT_FOR_TESTS = ethers.utils.parseEther('0.6');

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
          console.log('Requesting a verification...');
          const tx = await verifyTwitter.requestVerification(
            UNVERIFIED_USERNAME,
          );
          const txReceipt = await tx.wait(1);
          console.log('Verification requested.');
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
            assert.equal(isVerifiedHandle[1], VERIFIED_USERNAME_2);
            assert.equal(isVerifiedHandle.length, 2);
          };

          await requestAVerification(
            promiseFactory,
            VERIFIED_USERNAME_2,
            'TwitterAddVerifiedFailed',
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
