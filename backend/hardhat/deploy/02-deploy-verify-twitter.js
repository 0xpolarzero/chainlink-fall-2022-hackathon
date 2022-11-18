const { network, ethers } = require('hardhat');
const {
  developmentChains,
  LINK_TOKEN_MUMBAI,
  OPERATOR_MUMBAI,
  TWITTER_JOB_ID,
} = require('../helper-hardhat-config');
const { verify } = require('../utils/verify');

module.exports = async function({ getNamedAccounts, deployments }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const promiseFactory = await deployments.get('PromiseFactory');

  const verifyTwitter = await deploy('VerifyTwitter', {
    from: deployer,
    args: [
      LINK_TOKEN_MUMBAI,
      OPERATOR_MUMBAI,
      promiseFactory.address,
      TWITTER_JOB_ID,
    ],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    console.log('Verifying contract...');
    await verify(verifyTwitter.address, [
      LINK_TOKEN_MUMBAI,
      OPERATOR_MUMBAI,
      promiseFactory.address,
      TWITTER_JOB_ID,
    ]);
  }
};

module.exports.tags = ['all', 'verify-twitter', 'main'];
