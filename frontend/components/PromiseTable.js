import RibbonBadge from './utils/RibbonBadge';
import {
  columns as partiesColumns,
  displayPartiesData,
} from '../systems/promisePartiesData';
import {
  columns as contractColumns,
  displayContractData,
} from '../systems/promiseContractData';
import { displayPromiseStatus } from '../systems/promiseStatus';
import { Table } from 'antd';
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

  useEffect(() => {
    const contractDataToDisplay = displayContractData(contractAddress, pdfUri);
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
    );
    setPartiesData(partiesDataToDisplay);

    // Contract data, once fetched, will update the table
  }, [addressToApprovedStatus, addressToTwitterVerifiedStatus]);

  return (
    <div key='contract' className='card-item contract-identity'>
      <RibbonBadge isPromiseLocked={isPromiseLocked} />
      <Table
        dataSource={contractData}
        columns={contractColumns}
        pagination={false}
      />
      {/* </div> */}
      <div key='parties' className='card-item parties'>
        <Table
          title={() => <b>Involved parties</b>}
          dataSource={partiesData}
          columns={partiesColumns}
          pagination={tableParams.pagination}
          onChange={handleTableChange}
        />
      </div>
    </div>
  );
}
