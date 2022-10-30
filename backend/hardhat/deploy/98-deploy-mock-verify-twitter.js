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
  const promiseFactory = await deployments.get('PromiseFactory');

  const verifyTwitterMock = await deploy('VerifyTwitterMock', {
    from: deployer,
    args: [LINK_TOKEN_MUMBAI, OPERATOR, promiseFactory.address],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    console.log('Verifying contract...');
    await verify(verifyTwitterMock.address, [
      LINK_TOKEN_MUMBAI,
      OPERATOR,
      promiseFactory.address,
    ]);
  }
};

module.exports.tags = ['all', 'mocks'];
