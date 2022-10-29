const { network, ethers } = require('hardhat');
const { developmentChains, OPERATOR } = require('../helper-hardhat-config');
const { verify } = require('../utils/verify');

module.exports = async function({ getNamedAccounts, deployments }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const promiseFactory = await deploy('PromiseFactory', {
    from: deployer,
    args: [OPERATOR],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    console.log('Verifying contract...');
    await verify(promiseFactory.address, [OPERATOR]);
  }
};

module.exports.tags = ['all', 'promise-factory', 'main'];