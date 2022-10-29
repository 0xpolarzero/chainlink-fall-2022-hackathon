const { assert, expect } = require('chai');
const { developmentChains } = require('../../helper-hardhat-config');
const { deployments, network, ethers } = require('hardhat');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('VerifyTwitter unit tests', function() {
      let deployer;
      let user;
      let verifyTwitterDeploy;
      let verifyTwitter;
      let promiseFactoryDeploy;
      let promiseFactory;

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        user = accounts[1];
        await deployments.fixture('all');
        verifyTwitterDeploy = await ethers.getContract('VerifyTwitter');
        verifyTwitter = verifyTwitterDeploy.connect(deployer);
        promiseFactoryDeploy = await ethers.getContract('PromiseFactory');
        promiseFactory = promiseFactoryDeploy.connect(deployer);
      });

      describe.only('constructor', function() {
        it('Should initialize the contract correctly', async () => {
          // Should initialize the link token address, oracle address and promise factory contract correctly
          const linkTokenAddress = await verifyTwitter.linkToken();
          console.log(linkTokenAddress);
        });
      });
    });
