const { network, ethers } = require('hardhat');
const { developmentChains } = require('../helper-hardhat-config');
const { verify } = require('../utils/verify');
const { LINK_TOKEN_MUMBAI } = require('../helper-hardhat-config');

module.exports = async function({ getNamedAccounts, deployments }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const oracle = await deploy('Oracle', {
    from: deployer,
    args: [LINK_TOKEN_MUMBAI],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    console.log('Verifying contract...');
    await verify(oracle.address, []);
  }
};

module.exports.tags = ['all', 'oracle'];
