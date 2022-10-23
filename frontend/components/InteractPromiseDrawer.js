import FormattedAddress from './FormattedAddress';
import {
  columns,
  displayPartiesData,
  getPartiesApprovedStatus,
  getVerificationDiv,
} from '../systems/displayPartiesData';
import promiseContractAbi from '../constants/PromiseContract.json';
import { Button, Table } from 'antd';
import {
  useAccount,
  useProvider,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function InteractPromiseDrawer({ contractAttributes }) {
  const [partiesData, setPartiesData] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 5,
      position: ['bottomRight'],
    },
  });
  const [addressToApprovedStatus, setAddressToApprovedStatus] = useState([]);
  const [interactingUser, setInteractingUser] = useState({});
  const provider = useProvider();
  const { address: userAddress } = useAccount();

  const {
    promiseName,
    owner,
    contractAddress,
    pdfUri,
    partyNames,
    partyTwitterHandles,
    partyAddresses,
  } = contractAttributes;

  // PROMISE APPROVAL
  const { config: approveConfig, error: approveError } =
    usePrepareContractWrite({
      address: contractAddress,
      abi: promiseContractAbi,
      functionName: 'approvePromise',
      args: [],
      enabled: !!userAddress,
    });

  const {
    data: approvalData,
    write: approvePromise,
    isLoading: isApprovingPromise,
  } = useContractWrite({
    ...approveConfig,
    onSuccess: async (tx) => {
      console.log('pop');
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

  const handleSuccess = async (tx) => {
    console.log('pop');
    const txReceipt = await toast.promise(tx.wait(1), {
      pending: 'Approving promise...',
      success: 'Promise approved!',
      error: 'Error approving promise',
    });
    gatherPartiesData();
  };
  // ----------------

  const handleTableChange = (pagination) => {
    setTableParams({
      pagination,
    });
  };

  const gatherPartiesData = async () => {
    const partiesApprovedStatus = await getPartiesApprovedStatus(
      contractAddress,
      partyAddresses,
      provider,
    );
    setAddressToApprovedStatus(partiesApprovedStatus);

    // const partiesTwitterVerifiedStatus = await getPartiesTwitterVerifiedStatus();
    // setPartiesTwitterVerifiedStatus(partiesTwitterVerifiedStatus);
  };

  useEffect(() => {
    // Fetched contract data
    gatherPartiesData();

    // Make sure it doesn't show old data
    return () => {
      setPartiesData([]);
      setAddressToApprovedStatus([]);
    };

    // Make sure it doesn't keep the same data between differents panels
    // Both if the user changes account or if the panels are in the same collapse
  }, [userAddress, contractAddress]);

  useEffect(() => {
    // Display already fetched data
    const dataToDisplay = displayPartiesData(
      partyNames,
      partyAddresses,
      partyTwitterHandles,
      addressToApprovedStatus,
    );
    setPartiesData(dataToDisplay);

    // Display data for the interacting user
    const interactingUser = {
      address: userAddress,
      promiseApprovedStatus: addressToApprovedStatus[userAddress.toLowerCase()],
      promiseApprovedDiv: getVerificationDiv(
        addressToApprovedStatus[userAddress.toLowerCase()],
        'You did not approve the promise',
      ),
      // twitterVerifiedStatus: partiesTwitterVerifiedStatus[userAddress],
      twitterVerifiedStatus: false,
      twitterVerifiedDiv: getVerificationDiv(
        //   partiesTwitterVerifiedStatus[userAddress],
        false,
        'Your Twitter account is not verified',
      ),
    };
    setInteractingUser(interactingUser);

    // Contract data, once fetched, will update the table
  }, [addressToApprovedStatus]);

  return (
    <div className='promise-drawer'>
      <div key='contract' className='drawer-item contract-identity'>
        <div className='contract-address'>
          <div className='title'>Contract address </div>
          <FormattedAddress address={contractAddress} isShrinked='responsive' />
        </div>
        <div className='pdf-link'>
          <div className='title'>PDF link</div>
          {pdfUri}
        </div>
      </div>
      <div key='parties' className='drawer-item parties'>
        <div className='title'>Involved parties</div>
        {/* <div className='parties-list'> */}
        <Table
          dataSource={partiesData}
          columns={columns}
          pagination={tableParams.pagination}
          onChange={handleTableChange}
        />
      </div>
      <div className='drawer-item interaction'>
        <div className='promise-approve-status'>
          {interactingUser.promiseApprovedDiv}
        </div>
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

        <div className='twitter-verify-status'>
          {interactingUser.twitterVerifiedDiv}
        </div>
        {interactingUser.twitterVerifiedStatus ? (
          <div className='verified'>Twitter verified</div>
        ) : (
          <div className='twitter-verify-interact'>
            <Button type='primary'>Verify Twitter</Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Move pagination to the bottom in user promises drawer
