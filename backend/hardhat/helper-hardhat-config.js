const networkConfig = {
  31337: {
    name: 'localhost',
  },

  5: {
    name: 'goerli',
  },
};

const developmentChains = ['hardhat', 'localhost'];

const LINK_TOKEN_MUMBAI = '0x326C977E6efc84E512bB9C30f76E30c160eD06FB';
const OWNER = '0xc06d127E504a944f63Bc750D8F512556c576F3EF';
const OPERATOR = '0x2BB8Dd9C16edeF313eb9ccBd5F42A8b577cB1E3c';
const ORACLE_PAYMENT = '100000000000000000'; // 0.1 LINK

ADDRESS_HARDHAT = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
ADDRESS_MUMBAI = '0xc06d127E504a944f63Bc750D8F512556c576F3EF';

module.exports = {
  networkConfig,
  developmentChains,
  LINK_TOKEN_MUMBAI,
  OWNER,
  OPERATOR,
  ORACLE_PAYMENT,
  ADDRESS_HARDHAT,
  ADDRESS_MUMBAI,
};
