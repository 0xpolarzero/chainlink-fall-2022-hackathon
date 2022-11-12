import StorageStatusRibbon from './explore/StorageStatusRibbon';
import PromiseStatusBadge from './explore/PromiseStatusBadge';
import {
  columns as partiesColumns,
  displayPartiesData,
} from '../systems/promisePartiesData';
import {
  columns as contractColumns,
  displayContractData,
} from '../systems/promiseContractData';
import { Table, Tooltip } from 'antd';
import { useEffect, useState } from 'react';

export default function PromiseTable({
  contractAttributes,
  isPromiseLocked,
  addressToApprovedStatus,
  addressToTwitterVerifiedStatus,
}) {
  const [partiesData, setPartiesData] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 5,
      position: ['topRight'],
    },
  });
  const [contractData, setContractData] = useState([]);

  const {
    contractAddress,
    ipfsCid,
    arweaveId,
    partyNames,
    partyTwitterHandles,
    partyAddresses,
  } = contractAttributes;

  const handleTableChange = (pagination) => {
    setTableParams({
      pagination,
    });
  };

  useEffect(() => {
    const contractDataToDisplay = displayContractData(contractAddress, ipfsCid);
    setContractData(contractDataToDisplay);
  }, []);

  useEffect(() => {
    // Update parties data already fetched
    const partiesDataToDisplay = displayPartiesData(
      partyNames,
      partyAddresses,
      partyTwitterHandles,
      addressToApprovedStatus,
      addressToTwitterVerifiedStatus,
      isPromiseLocked,
    );
    setPartiesData(partiesDataToDisplay);

    // Contract data, once fetched, will update the table
    // In case a participant is added, the table needs to be updated
  }, [addressToApprovedStatus, addressToTwitterVerifiedStatus, partyAddresses]);

  return (
    <div key='contract' className='card-item contract-identity'>
      <StorageStatusRibbon
        contractAddress={contractAddress}
        arweaveId={arweaveId}
      />
      <Table
        dataSource={contractData}
        columns={contractColumns}
        pagination={false}
      />
      {/* </div> */}
      <div key='parties' className='card-item parties'>
        <Table
          title={() => (
            <b>
              Involved parties{' '}
              <Tooltip title='The parties added by the creator to the promise. The promise creator is the first party.'>
                <i className='fas fa-question-circle' />
              </Tooltip>
              <PromiseStatusBadge isPromiseLocked={isPromiseLocked} />
            </b>
          )}
          dataSource={partiesData}
          columns={partiesColumns}
          pagination={tableParams.pagination}
          onChange={handleTableChange}
        />
      </div>
    </div>
  );
}
