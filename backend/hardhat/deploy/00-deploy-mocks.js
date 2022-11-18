const { network, ethers } = require('hardhat');
const {
  LINK_TOKEN_MUMBAI,
  OPERATOR_MUMBAI,
  STORAGE_JOB_ID,
  TWITTER_JOB_ID,
} = require('../helper-hardhat-config');

module.exports = async function({ getNamedAccounts, deployments }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const accounts = await ethers.getSigners();
  const fakePromiseFactory = accounts[2];

  const mockPromiseFactory = await deploy('MockPromiseFactory', {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  await deploy('MockVerifyTwitter', {
    from: deployer,
    args: [
      LINK_TOKEN_MUMBAI,
      OPERATOR_MUMBAI,
      mockPromiseFactory.address,
      TWITTER_JOB_ID,
    ],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  await deploy('MockVerifyStorage', {
    from: deployer,
    args: [
      LINK_TOKEN_MUMBAI,
      OPERATOR_MUMBAI,
      mockPromiseFactory.address,
      fakePromiseFactory.address,
      STORAGE_JOB_ID,
    ],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  // We don't need to verify the mocks
};

module.exports.tags = ['all', 'mocks'];
