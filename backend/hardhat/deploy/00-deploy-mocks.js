const { network, ethers } = require('hardhat');
const {
  developmentChains,
  LINK_TOKEN_MUMBAI,
  OPERATOR,
} = require('../helper-hardhat-config');
const { verify } = require('../utils/verify');

module.exports = async function({ getNamedAccounts, deployments }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const chainlinkClientTestHelper = await deploy('ChainlinkClientTestHelper', {
    from: deployer,
    args: [LINK_TOKEN_MUMBAI, OPERATOR],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    console.log('Verifying contract...');
    await verify(chainlinkClientTestHelper.address, [
      LINK_TOKEN_MUMBAI,
      OPERATOR,
    ]);
  }
};

module.exports.tags = ['all', 'mocks'];
