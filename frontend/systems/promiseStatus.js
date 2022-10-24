import promiseContractAbi from '../constants/PromiseContract.json';
import { ethers } from 'ethers';

const promiseStatus = (contractAddress, provider) => {
  const getIsPromiseLocked = async () => {
    const contract = new ethers.Contract(
      contractAddress,
      promiseContractAbi,
      provider,
    );
    const isPromiseLocked = await contract.getIsPromiseLocked();

    return isPromiseLocked;
  };

  return {
    getIsPromiseLocked,
  };
};

export { promiseStatus };
