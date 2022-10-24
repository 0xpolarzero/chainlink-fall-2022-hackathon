import FormattedAddress from '../components/utils/FormattedAddress';
import promiseContractAbi from '../constants/PromiseContract.json';
import { Skeleton } from 'antd';
import { ethers } from 'ethers';

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: 'Twitter Handle',
    dataIndex: 'twitterHandle',
    key: 'twitterHandle',
  },
  {
    title: 'Twitter verified',
    dataIndex: 'twitterVerifiedDiv',
    key: 'twitterVerifiedDiv',
  },
  {
    title: 'Promise approved',
    dataIndex: 'promiseApprovedDiv',
    key: 'promiseApprovedDiv',
  },
];

const getPartiesApprovedStatus = async (
  contractAddress,
  partyAddresses,
  provider,
) => {
  // Use provider to get the current address
  const contract = new ethers.Contract(
    contractAddress,
    promiseContractAbi,
    provider,
  );
  const promises = [];
  for (let i = 0; i < partyAddresses.length; i++) {
    promises.push({
      address: partyAddresses[i],
      isPromiseApproved: await contract.getIsPromiseApproved(partyAddresses[i]),
    });
  }
  const result = await Promise.all(promises);

  // Now map each address to its promise approved status
  const addressToApprovedStatus = {};
  for (let i = 0; i < result.length; i++) {
    addressToApprovedStatus[result[i].address] = result[i].isPromiseApproved;
  }

  return addressToApprovedStatus;
};

const getPartiesTwitterVerifiedStatus = async () => {
  //
  // setAddressToTwitterVerifiedStatus(result);
};

const displayPartiesData = (
  partyNames,
  partyAddresses,
  partyTwitterHandles,
  addressToApprovedStatus,
  //   addressToTwitterVerifiedStatus,
) => {
  const dataToDisplay = [];

  for (let i = 0; i < partyNames.length; i++) {
    // ! FOR TESTING PURPOSES
    const isVerified = Math.floor(Math.random() * 2) === 0;
    dataToDisplay.push({
      key: i,
      name: partyNames[i],
      address: (
        <FormattedAddress address={partyAddresses[i]} isShrinked='responsive' />
      ),
      twitterHandle:
        partyTwitterHandles[i] === '' ? (
          'Not provided'
        ) : (
          <a
            href={`https://twitter.com/${partyTwitterHandles[i]}`}
            target='_blank'
          >
            @{partyTwitterHandles[i]}
          </a>
        ),
      // TODO Link to the Tx verification
      twitterVerifiedDiv: getVerificationDiv(
        // addressToTwitterVerifiedStatus[partyAddresses[i]]
        isVerified,
        'Not verified',
      ),
      promiseApprovedDiv: getVerificationDiv(
        addressToApprovedStatus[partyAddresses[i]],
        'Not approved',
      ),
    });
  }

  return dataToDisplay;
};

const getVerificationDiv = (isTrue, message) => {
  if (isTrue) {
    return (
      <a className='verified' href='some-tx-link' target='_blank'>
        <i className='fas fa-check'></i>
        <span>
          Tx <i className='fas fa-chain'></i>
        </span>
      </a>
    );
  } else if (isTrue === undefined) {
    return (
      <Skeleton active paragraph={{ rows: 1 }} title={false} loading={true} />
    );
  } else {
    return (
      <div className='not-verified'>
        <i className='fas fa-times'></i>
        <span>{message}</span>
      </div>
    );
  }
};

export {
  columns,
  displayPartiesData,
  getPartiesApprovedStatus,
  getVerificationDiv,
};
