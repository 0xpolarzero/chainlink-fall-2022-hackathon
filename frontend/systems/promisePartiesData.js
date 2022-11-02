import FormattedAddress from '../components/utils/FormattedAddress';
import promiseContractAbi from '../constants/PromiseContract.json';
import promiseFactoryAbi from '../constants/PromiseFactory.json';
import networkMapping from '../constants/networkMapping';
import { Skeleton } from 'antd';
import { ethers } from 'ethers';

const columns = [
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Twitter Handle',
    dataIndex: 'twitterHandle',
    key: 'twitterHandle',
    // If a Twitter handle was not provided, this column will show 'Not provided'
    // ... and span 2 columns
    render: (text, record) =>
      record.twitterHandle === null
        ? {
            children: getVerificationDiv(false, 'Not provided'),
            props: {
              colSpan: 2,
            },
          }
        : text,
  },
  {
    title: 'Twitter verified',
    dataIndex: 'twitterVerifiedDiv',
    key: 'twitterVerifiedDiv',
    // If the twitter handle was not provided, this column will not show
    render: (text, record) =>
      record.twitterHandle === null
        ? {
            children: null,
            props: {
              colSpan: 0,
            },
          }
        : text,
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
  for (const address of partyAddresses) {
    promises.push({
      address: address,
      isPromiseApproved: await contract.getIsPromiseApproved(address),
    });
  }
  const result = await Promise.all(promises);

  // Now map each address to its promise approved status
  const addressToApprovedStatus = {};
  for (const res of result) {
    addressToApprovedStatus[res.address] = res.isPromiseApproved;
  }

  return addressToApprovedStatus;
};

const getPartiesTwitterVerifiedStatus = async (
  partyTwitterHandles,
  partyAddresses,
  provider,
  chain,
) => {
  const promiseFactoryAddress =
    networkMapping[chain ? chain.id : '80001']['PromiseFactory'][0];
  const contract = new ethers.Contract(
    promiseFactoryAddress,
    promiseFactoryAbi,
    provider,
  );

  const mapping = [];
  for (const address of partyAddresses) {
    mapping.push({
      address: address,
      isTwitterVerified: await contract.getTwitterVerifiedHandle(address),
    });
  }
  const result = await Promise.all(mapping);

  const addressToTwitterVerifiedStatus = {};
  for (let i = 0; i < result.length; i++) {
    addressToTwitterVerifiedStatus[result[i].address] = result[
      i
    ].isTwitterVerified.some(
      (handle) => handle.toLowerCase() === partyTwitterHandles[i].toLowerCase(),
    );
  }

  return addressToTwitterVerifiedStatus;
};

const displayPartiesData = (
  partyNames,
  partyAddresses,
  partyTwitterHandles,
  addressToApprovedStatus,
  addressToTwitterVerifiedStatus,
) => {
  const dataToDisplay = [];

  for (let i = 0; i < partyNames.length; i++) {
    dataToDisplay.push({
      key: i + 1,
      name: partyNames[i],
      address: (
        <FormattedAddress address={partyAddresses[i]} isShrinked='responsive' />
      ),
      twitterHandle:
        partyTwitterHandles[i] === '' ? null : (
          // 'Not provided'
          <a
            href={`https://twitter.com/${partyTwitterHandles[i]}`}
            target='_blank'
          >
            @{partyTwitterHandles[i]}
          </a>
        ),
      // TODO Link to the Tx verification
      twitterVerifiedDiv: getVerificationDiv(
        addressToTwitterVerifiedStatus[partyAddresses[i]],
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
  } else if (isTrue === undefined || isTrue === null) {
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
  getPartiesTwitterVerifiedStatus,
  getVerificationDiv,
};
