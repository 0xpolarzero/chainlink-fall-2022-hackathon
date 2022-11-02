import { promiseStatus } from '../../systems/promiseStatus';
import promiseContractAbi from '../../constants/PromiseContract.json';
import { Button, Tooltip } from 'antd';
import { toast } from 'react-toastify';
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { useEffect, useState } from 'react';

export default function RowPromiseLock({
  interactingUser,
  contractAddress,
  userAddress,
  isPromiseLocked,
  addressToApprovedStatus,
  getPromiseStatus,
  allPartiesApproved,
}) {
  const [lockDiv, setLockDiv] = useState(null);
  const { config: lockConfig, error: lockError } = usePrepareContractWrite({
    address: contractAddress,
    abi: promiseContractAbi,
    functionName: 'lockPromise',
    args: [],
    enabled:
      !!userAddress &&
      // At least make sure it's approved for the user, to avoid unnecessary errors
      addressToApprovedStatus[userAddress.toLowerCase()] === true,
  });

  const {
    data: lockData,
    write: lockPromise,
    isLoading: isLockingPromise,
  } = useContractWrite({
    ...lockConfig,
    onSuccess: async (tx) => {
      const txReceipt = await toast.promise(tx.wait(1), {
        pending: 'Locking promise...',
        success: 'Promise locked!',
        error: 'Error locking promise',
      });
      getPromiseStatus();
    },
    onError: (err) => {
      toast.error('Error locking promise');
      console.log('error locking promise', err);
    },
  });

  const { isLoading: isWaitingForLock } = useWaitForTransaction({
    hash: lockData?.hash,
    confirmations: 1,
  });

  useEffect(() => {
    setLockDiv(promiseStatus().getLockDiv(isPromiseLocked, 'Promise unlocked'));
  }, [isPromiseLocked]);

  return (
    <>
      <div className='promise-lock-status'>{lockDiv}</div>
      {isPromiseLocked ? (
        <div className='verified'>Promise locked</div>
      ) : (
        <div className='promise-lock-interact'>
          <Tooltip
            title={
              !allPartiesApproved
                ? 'All parties must approve the promise before it can be locked.'
                : ''
            }
          >
            <Button
              type='primary'
              onClick={lockPromise}
              loading={isLockingPromise || isWaitingForLock}
              disabled={!allPartiesApproved}
            >
              Lock promise
            </Button>
          </Tooltip>
        </div>
      )}
    </>
  );
}
