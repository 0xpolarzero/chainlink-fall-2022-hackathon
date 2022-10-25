import promiseContractAbi from '../constants/PromiseContract.json';
import { Skeleton } from 'antd';
import { ethers } from 'ethers';

const promiseStatus = () => {
  const getIsPromiseLocked = async (contractAddress, provider) => {
    const contract = new ethers.Contract(
      contractAddress,
      promiseContractAbi,
      provider,
    );
    const isPromiseLocked = await contract.getIsPromiseLocked();

    return isPromiseLocked;
  };

  const getLockDiv = (isTrue, message) => {
    if (isTrue) {
      return (
        <a className='verified' href='some-tx-link' target='_blank'>
          <i className='fas fa-lock'></i>
          <span>
            Tx <i className='fas fa-chain'></i>
          </span>
        </a>
      );
    } else if (isTrue === undefined || isTrue === null) {
      return (
        <Skeleton active paragraph={{ rows: 1 }} title={false} loading={true} />
      );
    } else {
      return (
        <div className='warning'>
          <i className='fas fa-unlock'></i>
          <span>{message}</span>
        </div>
      );
    }
  };

  return {
    getIsPromiseLocked,
    getLockDiv,
  };
};

export { promiseStatus };
