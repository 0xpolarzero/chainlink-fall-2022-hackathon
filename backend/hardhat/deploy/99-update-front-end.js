const { ethers, network } = require('hardhat');
const fs = require('fs');

const frontEndContractsFile = '../../frontend/constants/networkMapping.json';
const frontEndAbiFolder = '../../frontend/constants/';

module.exports = async () => {
  if (process.env.UPDATE_FRONT_END) {
    console.log('Updating front end...');
    await updateContractAddresses();
    await updateAbi();
  }
};

async function updateContractAddresses() {
  const promiseFactory = await ethers.getContract('PromiseFactory');
  const verifyTwitter = await ethers.getContract('VerifyTwitter');
  const chainId = network.config.chainId;

  const contractAddresses = JSON.parse(
    fs.readFileSync(frontEndContractsFile, 'utf8'),
  );
  if (chainId in contractAddresses) {
    // PromiseFactory
    if (
      !contractAddresses[chainId]['PromiseFactory'].includes(
        promiseFactory.address,
      )
    ) {
      contractAddresses[chainId]['PromiseFactory'].push(promiseFactory.address);
    }
    // VerifyTwitter
    if (
      !contractAddresses[chainId]['VerifyTwitter'].includes(
        verifyTwitter.address,
      )
    ) {
      contractAddresses[chainId]['VerifyTwitter'].push(verifyTwitter.address);
    }
  } else {
    contractAddresses[chainId] = {
      PromiseFactory: [promiseFactory.address],
      VerifyTwitter: [verifyTwitter.address],
    };
  }

  fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));

  console.log('Front end updated!');
}

async function updateAbi() {
  // PromiseFactory
  const promiseFactory = await ethers.getContract('PromiseFactory');
  fs.writeFileSync(
    `${frontEndAbiFolder}PromiseFactory.json`,
    promiseFactory.interface.format(ethers.utils.FormatTypes.json),
  );
  // VerifyTwitter
  const verifyTwitter = await ethers.getContract('VerifyTwitter');
  fs.writeFileSync(
    `${frontEndAbiFolder}VerifyTwitter.json`,
    verifyTwitter.interface.format(ethers.utils.FormatTypes.json),
  );
}

module.exports.tags = ['all', 'frontend'];
