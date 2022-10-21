import FormattedAddress from './FormattedAddress';
import { displayPdf } from '../systems/displayPdf.js';
import { Collapse, Table } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

export default function PromisesCollapse({ promises }) {
  const { Panel } = Collapse;

  return (
    <Collapse
      accordion={true}
      bordered={false}
      expandIcon={({ isActive }) => (
        <CaretRightOutlined rotate={isActive ? 90 : 0} />
      )}
      className='site-collapse-custom-collapse'
    >
      {promises.map((promise) => {
        return (
          <Panel
            header={
              <div className='promise-header'>
                <div className='promise-header-name'>
                  {promise.agreementName}
                </div>
                <div className='promise-header-address'>
                  Created by{' '}
                  <FormattedAddress
                    address={promise.owner}
                    isShrinked='responsive'
                  />
                </div>
              </div>
            }
            key={promise.contractAddress}
            className='site-collapse-custom-panel'
          >
            <ContractCard key={promise.id} contractAttributes={promise} />
          </Panel>
        );
      })}
    </Collapse>
  );
}

function ContractCard({ contractAttributes }) {
  const [partiesData, setPartiesData] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 5,
      position: ['topRight'],
    },
  });

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
      dataIndex: 'twitterVerified',
      key: 'twitterVerified',
    },
  ];

  const {
    agreementName: promiseName,
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

  useEffect(() => {
    const partiesData = [];

    for (let i = 0; i < partyNames.length; i++) {
      // ! FOR TESTING PURPOSES
      const isVerified = Math.floor(Math.random() * 2) === 0;
      partiesData.push({
        key: i,
        name: partyNames[i],
        address: (
          <FormattedAddress
            address={partyAddresses[i]}
            isShrinked='responsive'
          />
        ),
        twitterHandle: (
          <a
            href={`https://twitter.com/${partyTwitterHandles[i]}`}
            target='_blank'
          >
            @{partyTwitterHandles[i]}
          </a>
        ),
        // TODO Link to the Tx verification
        twitterVerified: isVerified ? (
          <a className='verified' href='some-tx-link' target='_blank'>
            <i className='fas fa-check'></i>
            <span>
              Tx <i className='fa-solid fa-chain'></i>
            </span>
          </a>
        ) : (
          <div className='not-verified'>
            <i className='fas fa-times'></i>
            <span>Not verified</span>
          </div>
        ),
      });
    }
    setPartiesData(partiesData);
  }, []);

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
        {/* <div className='parties-list'> */}
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
