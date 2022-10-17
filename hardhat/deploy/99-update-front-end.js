const { ethers, network } = require('hardhat');
const fs = require('fs');

const frontEndContractsFile = '../nextjs/constants/networkMapping.json';
const frontEndAbiFolder = '../nextjs/constants/';

module.exports = async () => {
  if (process.env.UPDATE_FRONT_END) {
    console.log('Updating front end...');
    await updateContractAddresses();
    await updateAbi();
  }
};

async function updateContractAddresses() {
  const masterContract = await ethers.getContract('MasterContract');
  const chainId = network.config.chainId;

  const contractAddresses = JSON.parse(
    fs.readFileSync(frontEndContractsFile, 'utf8'),
  );
  if (chainId in contractAddresses) {
    if (
      !contractAddresses[chainId]['MasterContract'].includes(
        masterContract.address,
      )
    ) {
      contractAddresses[chainId]['MasterContract'].push(masterContract.address);
    }
  } else {
    contractAddresses[chainId] = {
      MasterContract: [masterContract.address],
    };
  }

  fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));

  console.log('Front end updated!');
}

async function updateAbi() {
  const masterContract = await ethers.getContract('MasterContract');
  fs.writeFileSync(
    `${frontEndAbiFolder}MasterContract.json`,
    masterContract.interface.format(ethers.utils.FormatTypes.json),
  );
}

module.exports.tags = ['all', 'frontend'];
