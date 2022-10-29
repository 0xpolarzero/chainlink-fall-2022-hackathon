const { assert, expect } = require('chai');
const { developmentChains } = require('../../helper-hardhat-config');
const { deployments, network, ethers } = require('hardhat');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('VerifyTwitterMock unit tests', function() {
      let deployer;
      let user;
      let verifyTwitterMockDeploy;
      let verifyTwitterMock;
      let promiseFactory;

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        user = accounts[1];
        await deployments.fixture(['mocks', 'main']);
        verifyTwitterMockDeploy = await ethers.getContract('VerifyTwitterMock');
        verifyTwitterMock = verifyTwitterMockDeploy.connect(deployer);
        // Get the promise factory contract but it will be deployed in the next test
        promiseFactory = await ethers.getContract('PromiseFactory', deployer);
      });

      describe.only('constructor', function() {
        it('Should initialize the contract correctly', async () => {
          // We can make use of additional functions and events in both test helpers
          const linkAddress = await verifyTwitterMock.publicChainlinkToken();
          const oracleAddress = await verifyTwitterMock.publicOracleAddress();
          const promiseFactoryAddress = await verifyTwitterMock.getPromiseFactoryContract();
          // Bonus
          const jobId = await verifyTwitterMock.getJobId();
          const oraclePayment = await verifyTwitterMock.getOraclePayment();

          console.log('linkAddress', linkAddress);
          console.log('oracleAddress', oracleAddress);
          console.log('promiseFactoryAddress', promiseFactoryAddress);
          console.log('jobId', jobId);
          console.log('oraclePayment', oraclePayment);
        });
      });
    });
