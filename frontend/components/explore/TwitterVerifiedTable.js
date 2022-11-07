import { Table, Tooltip } from 'antd';
import { useEffect, useState } from 'react';

const columns = [
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
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
                <br />
                <br />
                Users can verify multiple addresses with the same Twitter
                account, as well as the opposite.
              </span>
            }
          >
            <i className='fas fa-question-circle' />
          </Tooltip>
        </>
      );
    },
    dataIndex: 'twitterHandles',
    key: 'twitterHandles',
  },
];

export default function TwitterVerifiedTable({ twitterVerifiedUsers }) {
  const [twitterVerifiedData, setTwitterVerifiedData] = useState([]);
  //   const [tableParams, setTableParams] = useState({
  //     pagination: {
  //       current: 1,
  //       pageSize: 5,
  //       position: ['topRight'],
  //     },
  //   });

  //   const handleTableChange = (pagination) => {
  //     setTableParams({
  //       pagination,
  //     });
  //   };

  useEffect(() => {
    const data = twitterVerifiedUsers.map((user) => {
      return {
        key: user.address,
        address: user.address,
        twitterHandles: user.twitterHandles,
      };
    });
    setTwitterVerifiedData(data);
  }, [twitterVerifiedUsers]);

  return (
    <div className='card-item parties'>
      <Table
        columns={columns}
        dataSource={twitterVerifiedData}
        // onChange={handleTableChange}
        // {...tableParams}
      />
    </div>
  );
}
