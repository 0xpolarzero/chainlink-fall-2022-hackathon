import promiseContractAbi from '../../constants/PromiseContract.json';
import { Button, Skeleton } from 'antd';
import { toast } from 'react-toastify';
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';

export default function RowPromiseApproval({
  interactingUser,
  contractAddress,
  userAddress,
  gatherPartiesData,
}) {
  const { config: approveConfig, error: approveError } =
    usePrepareContractWrite({
      address: contractAddress,
      abi: promiseContractAbi,
      functionName: 'approvePromise',
      args: [],
      enabled:
        !!userAddress &&
        interactingUser.promiseApprovedStatus !== undefined &&
        !interactingUser.promiseApprovedStatus,
    });

  const {
    data: approvalData,
    write: approvePromise,
    isLoading: isApprovingPromise,
  } = useContractWrite({
    ...approveConfig,
    onSuccess: async (tx) => {
      const txReceipt = await toast.promise(tx.wait(1), {
        pending: 'Approving promise...',
        success: 'Promise approved!',
        error: 'Error approving promise',
      });
      gatherPartiesData();
    },
    onError: (err) => {
      toast.error('Error approving promise');
      console.log('error approving promise', err);
    },
  });

  const { isLoading: isWaitingForApproval } = useWaitForTransaction({
    hash: approvalData?.hash,
    confirmations: 1,
  });

  // If the users approved status is undefined, it's still loading
  if (interactingUser.promiseApprovedStatus === undefined) {
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
      {interactingUser.promiseApprovedStatus ? (
        <>
          <div className='verified' style={{ justifySelf: 'left' }}>
            <i className='fas fa-check'></i>
            Promise approved
          </div>
          <div></div>
        </>
      ) : (
        <>
          <div className='not-verified'>
            <i className='fas fa-times'></i>
            <span>Promise not approved</span>
          </div>
          <div className='promise-approve-interact'>
            <Button
              type='primary'
              onClick={approvePromise}
              loading={isApprovingPromise || isWaitingForApproval}
            >
              <i className='fas fa-signature' /> Approve promise
            </Button>
          </div>
        </>
      )}
    </>
  );
}
