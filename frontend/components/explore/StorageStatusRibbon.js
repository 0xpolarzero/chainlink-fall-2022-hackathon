import promiseContractAbi from '../../constants/PromiseContract.json';
import { Badge, Skeleton, Popover, Tooltip } from 'antd';
import { ethers } from 'ethers';
import { useProvider } from 'wagmi';
import { useEffect, useState } from 'react';

export default function StorageStatusRibbon({
  contractAddress: promiseContractAddress,
}) {
  const [storageStatus, setStorageStatus] = useState(null);
  const [storageStatusTitle, setStorageStatusTitle] = useState('');
  const [storateStatusDesc, setStorageStatusDesc] = useState('');
  const [storageStatusColor, setStorageStatusColor] = useState('default');
  const [storageStatusIcon, setStorageStatusIcon] = useState(
    'fas fa-spinner fa-spin',
  );
  const provider = useProvider();

  const getStorageStatus = async () => {
    const promiseContract = new ethers.Contract(
      promiseContractAddress,
      promiseContractAbi,
      provider,
    );
    const storageStatus = await promiseContract.getStorageStatus();
    setStorageStatus(storageStatus);
  };

  useEffect(() => {
    getStorageStatus();
  }, []);

  useEffect(() => {
    if (storageStatus === 0) {
      setStorageStatusTitle('Verification pending...');
      setStorageStatusDesc(
        'The provided IPFS CID (and eventually Arweave ID) are waiting to be verified by the Chainlink oracle.',
      );
      setStorageStatusColor('var(--toastify-color-error)');
      setStorageStatusIcon('fas fa-spinner fa-spin');
    } else if (storageStatus === 1) {
      setStorageStatusTitle('Not verified');
      setStorageStatusDesc(
        "The provided IPFS CID (and eventually Arweave ID) failed to be verified by the Chainlink oracle. We can't guarantee the integrity of the data.",
      );
      setStorageStatusColor('var(--toastify-color-warning)');
      setStorageStatusIcon('fas fa-warning');
    } else if (storageStatus === 2) {
      setStorageStatusTitle('Verified');
      setStorageStatusDesc(
        'The provided IPFS CID was verified by the Chainlink oracle. The data on IPFS was picked up by our node.',
      );
      setStorageStatusColor('var(--toastify-color-success)');
      setStorageStatusIcon('fas fa-check');
    } else if (storageStatus === 3) {
      setStorageStatusTitle('Verified');
      setStorageStatusDesc(
        'The The provided IPFS CID and  Arweave ID were verified by the Chainlink oracle. The data on IPFS was picked up by our node and an archive was sent to the Arweave network for permanent storage.',
      );
      setStorageStatusColor('var(--toastify-color-success)');
      setStorageStatusIcon('fas fa-check');
    }
  }, [storageStatus]);

  if (storageStatus === null) {
    return (
      <div className='security'>
        <Badge.Ribbon
          text={<i className='fas fa-spinner fa-spin' />}
          placement='end'
          color={storageStatusColor}
        />
      </div>
    );
  }

  return (
    <div className='storage-ribbon'>
      <Tooltip title={storateStatusDesc} trigger='hover'>
        <Badge.Ribbon
          text={
            <div>
              <i className={storageStatusIcon} /> {storageStatusTitle}
            </div>
          }
          color={storageStatusColor}
        />
        <span
          className='security-status'
          style={{ color: storageStatusColor }}
        ></span>
      </Tooltip>
    </div>
  );
}
