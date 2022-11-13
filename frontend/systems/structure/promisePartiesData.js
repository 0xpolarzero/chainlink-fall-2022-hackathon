import FormattedAddress from '../../components/utils/FormattedAddress';
import promiseContractAbi from '../../constants/PromiseContract.json';
import promiseFactoryAbi from '../../constants/PromiseFactory.json';
import networkMapping from '../../constants/networkMapping';
import { Skeleton, Tooltip } from 'antd';
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
  },
  {
    title: () => {
      return (
        <>
          Twitter verified{' '}
          <Tooltip
            title={
              <span>
                The verification is performed by a{' '}
                <a
                  href='https://docs.chain.link/chainlink-nodes/'
                  target='_blank'
                >
                  Chainlink Node
                </a>{' '}
                & an External Adapter leveraging the Twitter API to verify the
                ownership of the Twitter account. The user must tweet a
                verification message containing their address with this account.
              </span>
            }
          >
            <i className='fas fa-question-circle' />
          </Tooltip>
        </>
      );
    },
    dataIndex: 'twitterVerifiedDiv',
    key: 'twitterVerifiedDiv',
  },
  {
    title: () => {
      return (
        <>
          Promise approved{' '}
          <Tooltip
            title={
              <span>
                The parties involved by the creator must approve the promise
                with the address that has been provided. Only then the promise
                can be locked and backed up.
              </span>
            }
          >
            <i className='fas fa-question-circle' />
          </Tooltip>
        </>
      );
    },
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
  isPromiseLocked,
) => {
  const dataToDisplay = [];

  for (let i = 0; i < partyNames.length; i++) {
    dataToDisplay.push({
      key: i + 1,
      name: partyNames[i],
      address: (
        <FormattedAddress
          address={partyAddresses[i]}
          isShrinked='responsive'
          type='eth'
        />
      ),
      twitterHandle:
        partyTwitterHandles[i] === '' ? (
          <div className='warning'>
            <i className='fas fa-warning'></i> Not provided
          </div>
        ) : (
          // 'Not provided'
          <a
            href={`https://twitter.com/${partyTwitterHandles[i]}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            @{partyTwitterHandles[i]}
          </a>
        ),
      twitterVerifiedDiv:
        partyTwitterHandles[i] === ''
          ? null
          : getVerificationDiv(
              addressToTwitterVerifiedStatus[partyAddresses[i]],
              'Not verified',
              'twitter',
            ),
      promiseApprovedDiv: getVerificationDiv(
        addressToApprovedStatus[partyAddresses[i]],
        'Not approved',
        'approved',
      ),
    });
  }

  return dataToDisplay;
};

const getVerificationDiv = (isTrue, message, type) => {
  if (isTrue === undefined || isTrue === null) {
    return (
      <Skeleton active paragraph={{ rows: 1 }} title={false} loading={true} />
    );
  } else if (isTrue) {
    return (
      <div className='verified'>
        <i className='fas fa-check'></i>
        Yes
      </div>
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
