import FormattedAddress from './FormattedAddress';
import {
  columns,
  displayPartiesData,
  getPartiesApprovedStatus,
  getVerificationDiv,
} from '../systems/displayPartiesData';
import { Button, Table } from 'antd';
import { useAccount, useProvider } from 'wagmi';
import { useEffect, useState } from 'react';

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

  const handleTableChange = (pagination) => {
    setTableParams({
      pagination,
    });
  };

  const gatherPartiesData = async () => {
    const dataToDisplay = displayPartiesData(
      partyNames,
      partyAddresses,
      partyTwitterHandles,
      addressToApprovedStatus,
    );
    setPartiesData(dataToDisplay);

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
    gatherPartiesData();

    const interactingUser = {
      address: userAddress,
      promiseApprovedStatus: addressToApprovedStatus[userAddress],
      promiseApprovedDiv: getVerificationDiv(
        addressToApprovedStatus[userAddress],
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
  }, []);

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
        {interactingUser.promiseApprovedStatus ? null : (
          <div className='promise-approve-interact'>
            <Button type='primary'>Approve promise</Button>
          </div>
        )}

        <div className='twitter-verify-status'>
          {interactingUser.twitterVerifiedDiv}
        </div>
        {interactingUser.twitterVerifiedStatus ? null : (
          <div className='twitter-verify-interact'>
            <Button type='primary'>Verify Twitter</Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Move pagination to the bottom in user promises drawer
