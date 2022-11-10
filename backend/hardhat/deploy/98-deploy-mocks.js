const { network, ethers } = require('hardhat');
const {
  LINK_TOKEN_MUMBAI,
  OPERATOR_MUMBAI,
} = require('../helper-hardhat-config');
const { verify } = require('../utils/verify');

// Usually, deploying mocks is done first (00-...), but here
// we need to deploy the PromiseFactory first to get its address

module.exports = async function({ getNamedAccounts, deployments }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const accounts = await ethers.getSigners();
  const fakePromiseFactory = accounts[2];
  const promiseFactory = await deployments.get('PromiseFactory');

  const verifyTwitterMock = await deploy('VerifyTwitterMock', {
    from: deployer,
    args: [LINK_TOKEN_MUMBAI, OPERATOR_MUMBAI, promiseFactory.address],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  const verifyStorageMock = await deploy('VerifyStorageMock', {
    from: deployer,
    args: [
      LINK_TOKEN_MUMBAI,
      OPERATOR_MUMBAI,
      promiseFactory.address,
      fakePromiseFactory.address,
    ],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  // We don't need to verify the mocks
};

module.exports.tags = ['all', 'mocks'];
