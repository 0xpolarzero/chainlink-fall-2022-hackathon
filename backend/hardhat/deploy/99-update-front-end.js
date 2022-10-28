const { ethers, network } = require('hardhat');
const fs = require('fs');

const frontEndContractsFile = '../../../frontend/constants/networkMapping.json';
const frontEndAbiFolder = '../../../frontend/constants/';

module.exports = async () => {
  if (process.env.UPDATE_FRONT_END) {
    console.log('Updating front end...');
    await updateContractAddresses();
    await updateAbi();
  }
};

async function updateContractAddresses() {
  const promiseFactory = await ethers.getContract('PromiseFactory');
  const chainId = network.config.chainId;

  const contractAddresses = JSON.parse(
    fs.readFileSync(frontEndContractsFile, 'utf8'),
  );
  if (chainId in contractAddresses) {
    if (
      !contractAddresses[chainId]['PromiseFactory'].includes(
        promiseFactory.address,
      )
    ) {
      contractAddresses[chainId]['PromiseFactory'].push(promiseFactory.address);
    }
  } else {
    contractAddresses[chainId] = {
      PromiseFactory: [promiseFactory.address],
    };
  }

  fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));

  console.log('Front end updated!');
}

async function updateAbi() {
  const promiseFactory = await ethers.getContract('PromiseFactory');
  fs.writeFileSync(
    `${frontEndAbiFolder}PromiseFactory.json`,
    promiseFactory.interface.format(ethers.utils.FormatTypes.json),
  );
}

module.exports.tags = ['all', 'frontend'];
