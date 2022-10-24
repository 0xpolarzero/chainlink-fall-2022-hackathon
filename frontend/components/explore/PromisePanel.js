import FormattedAddress from '../utils/FormattedAddress';
import {
  columns,
  displayPartiesData,
  getPartiesApprovedStatus,
  getVerificationDiv,
} from '../../systems/displayPartiesData';
import { displayPdf } from '../../systems/displayPdf';
import { Table } from 'antd';
import { useProvider } from 'wagmi';
import { useEffect, useState } from 'react';

export default function PromisePanel({ contractAttributes }) {
  const [partiesData, setPartiesData] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 5,
      position: ['topRight'],
    },
  });
  const [addressToApprovedStatus, setAddressToApprovedStatus] = useState([]);
  const provider = useProvider();

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
    // Fetch contract data
    gatherPartiesData();
  }, []);

  useEffect(() => {
    // Update parties data already fetched
    const dataToDisplay = displayPartiesData(
      partyNames,
      partyAddresses,
      partyTwitterHandles,
      addressToApprovedStatus,
    );
    setPartiesData(dataToDisplay);

    // Contract data, once fetched, will update the table
  }, [addressToApprovedStatus]);

  return (
    <div className='promise-card'>
      <div key='contract' className='card-item contract-identity'>
        <div className='contract-address'>
          <div className='title'>Contract address </div>
          <FormattedAddress address={contractAddress} isShrinked='responsive' />
        </div>
        <div className='pdf-link'>
          <div className='title'>PDF link</div>
          {pdfUri}
        </div>
      </div>
      <div key='parties' className='card-item parties'>
        <div className='title'>Involved parties</div>
        <Table
          dataSource={partiesData}
          columns={columns}
          pagination={tableParams.pagination}
          onChange={handleTableChange}
        />
      </div>
      <div key='viewer' className='card-item pdf-viewer'>
        {/* {displayPdf(pdfUri)} */}
        {displayPdf(
          'ipfs:///QmR7GSQM93Cx5eAg6a6yRzNde1FQv7uL6X1o4k7zrJa3LX/ipfs.draft3.pdf',
        )}
      </div>
    </div>
  );
}
