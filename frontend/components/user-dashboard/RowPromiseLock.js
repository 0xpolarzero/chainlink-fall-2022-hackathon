import { promiseStatus } from '../../systems/structure/promiseStatus';
import promiseContractAbi from '../../constants/PromiseContract.json';
import { Button, Skeleton, Tooltip } from 'antd';
import { toast } from 'react-toastify';
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';

export default function RowPromiseLock({
  contractAddress,
  userAddress,
  isPromiseLocked,
  getPromiseStatus,
  allPartiesApproved,
}) {
  const { config: lockConfig, error: lockError } = usePrepareContractWrite({
    address: contractAddress,
    abi: promiseContractAbi,
    functionName: 'lockPromise',
    args: [],
    enabled:
      !!userAddress &&
      // Make sure it's approved for each user of the promise
      allPartiesApproved &&
      !isPromiseLocked,
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

  // If the users approved status is null, it's still loading
  if (allPartiesApproved === null) {
    return (
      <Skeleton
        className='span-double'
        active
        paragraph={{ rows: 1 }}
        title={false}
      />
    );
  }

  return (
    <>
      {isPromiseLocked ? (
        <>
          <div className='verified' style={{ justifySelf: 'left' }}>
            <i className='fas fa-lock'></i>
            Promise locked
          </div>
          <div></div>
        </>
      ) : (
        <>
          <div className='warning'>
            <i className='fas fa-unlock'></i>
            <Tooltip title='Locking the promise will prevent any new participant to be added. This action cannot be undone.'>
              <span>Promise unlocked</span>
            </Tooltip>
          </div>
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
                <i className='fas fa-lock' /> Lock promise
              </Button>
            </Tooltip>
          </div>
        </>
      )}
    </>
  );
}
