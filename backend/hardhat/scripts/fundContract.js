const { ethers } = require('hardhat');
const { LINK_TOKEN_MUMBAI } = require('../helper-hardhat-config');

const VERIFY_TWITTER_ADDRESS = '0x734f9D8321e4D19815E82C0c330f00ab2fbaEe92';
const FUND_VALUE = ethers.utils.parseEther('0.2');

const fundContract = async () => {
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];
  const verifyTwitter = await ethers.getContractAt(
    'VerifyTwitter',
    VERIFY_TWITTER_ADDRESS,
    deployer,
  );

  const linkBalance = await verifyTwitter.getLinkBalance();

  if (linkBalance < FUND_VALUE) {
    console.log('Funding VerifyTwitter contract with LINK...');
    const linkToken = await ethers.getContractAt(
      '@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol:LinkTokenInterface',
      LINK_TOKEN_MUMBAI,
      deployer,
    );
    await linkToken.transfer(verifyTwitter.address, FUND_VALUE);
  }
  console.log('Funding complete.');
};

module.exports = {
  fundContract,
};
