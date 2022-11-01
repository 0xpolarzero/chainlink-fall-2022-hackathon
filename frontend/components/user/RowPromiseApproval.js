import { getVerificationDiv } from '../../systems/promisePartiesData';
import promiseContractAbi from '../../constants/PromiseContract.json';
import { Button } from 'antd';
import { toast } from 'react-toastify';
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { useEffect, useState } from 'react';

export default function RowPromiseApproval({
  interactingUser,
  contractAddress,
  userAddress,
  addressToApprovedStatus,
  gatherPartiesData,
}) {
  const [verificationDiv, setVerificationDiv] = useState(null);
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

  useEffect(() => {
    setVerificationDiv(
      getVerificationDiv(
        addressToApprovedStatus[userAddress.toLowerCase()],
        'Promise not approved',
      ),
    );
  }, [addressToApprovedStatus, userAddress]);

  return (
    <>
      <div className='promise-approve-status'>{verificationDiv}</div>
      {interactingUser.promiseApprovedStatus ? (
        <div className='verified'>Promise approved</div>
      ) : (
        <div className='promise-approve-interact'>
          <Button
            type='primary'
            onClick={approvePromise}
            loading={isApprovingPromise || isWaitingForApproval}
          >
            Approve promise
          </Button>
        </div>
      )}
    </>
  );
}
