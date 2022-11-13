const { ethers } = require('hardhat');
const { LINK_TOKEN_MUMBAI } = require('../helper-hardhat-config');

// Choose a fund amount to send to the verifier contracts
const LINK_FUNDING_AMOUNT = ethers.utils.parseEther('2');

module.exports = async function({ getNamedAccounts, deployments }) {
  const { deployer } = await getNamedAccounts();
  let promiseFactory = await deployments.get('PromiseFactory');
  let verifyTwitter = await deployments.get('VerifyTwitter');
  let verifyStorage = await deployments.get('VerifyStorage');

  // Grab contracts
  promiseFactory = await ethers.getContractAt(
    'PromiseFactory',
    promiseFactory.address,
    deployer,
  );
  verifyTwitter = await ethers.getContractAt(
    'VerifyTwitter',
    verifyTwitter.address,
    deployer,
  );
  verifyStorage = await ethers.getContractAt(
    'VerifyStorage',
    verifyStorage.address,
    deployer,
  );

  // Set verifiers
  console.log('Setting allowed verifiers...');
  await promiseFactory.setTwitterVerifier(verifyTwitter.address);
  await promiseFactory.setStorageVerifier(verifyStorage.address);

  // Fund contracts with Link
  const linkToken = await ethers.getContractAt(
    '@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol:LinkTokenInterface',
    LINK_TOKEN_MUMBAI,
    deployer,
  );

  console.log('Funding VerifyTwitter contract with LINK...');
  await linkToken.transfer(verifyTwitter.address, LINK_FUNDING_AMOUNT);
  console.log('Funding VerifyStorage contract with LINK...');
  await linkToken.transfer(verifyStorage.address, LINK_FUNDING_AMOUNT);
};

module.exports.tags = ['all', 'prepare', 'main'];
