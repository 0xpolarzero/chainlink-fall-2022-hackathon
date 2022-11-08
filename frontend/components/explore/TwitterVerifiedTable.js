import FormattedAddress from '../utils/FormattedAddress';
import { Button, Input, Table, Tooltip } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';

export default function TwitterVerifiedTable({ twitterVerifiedUsers }) {
  const [twitterVerifiedData, setTwitterVerifiedData] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      position: ['bottomCenter'],
    },
  });
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  const handleTableChange = (pagination) => {
    setTableParams({
      pagination,
    });
  };

  // Handling search ----------------------------------------------------------
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters, confirm) => {
    clearFilters();
    setSearchText('');
    confirm();
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div className='search-filter-container'>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
        />
        <Button
          type='primary'
          onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
          icon={<SearchOutlined />}
          size='small'
        >
          Search
        </Button>
        <Button
          onClick={() => clearFilters && handleReset(clearFilters, confirm)}
          size='small'
        >
          Reset
        </Button>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? 'var(--popstar)' : undefined,
          transform: filtered ? 'scale(1.1)' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  });

  // Columns for the table ----------------------------------------------------
  const columns = [
    {
      title: 'Ethereum address',
      dataIndex: 'address',
      key: 'address',
      ...getColumnSearchProps('address'),
      render: (address) => (
        <FormattedAddress
          address={address}
          isShrinked='responsive'
          type='eth'
        />
      ),
    },
    {
      title: () => {
        return (
          <>
            Verified handles{' '}
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
                  verification message containing their address with this
                  account.
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
      ...getColumnSearchProps('twitterHandles'),
      render: (twitterHandles) => {
        return twitterHandles.map((handle) => (
          <a
            href={`https://twitter.com/${handle}`}
            target='_blank'
            rel='noreferrer'
          >
            @{handle}
          </a>
        ));
      },
    },
  ];

  // Fetching & initializing data ------------------------------------------------------------
  useEffect(() => {
    let count = 0;
    const data = twitterVerifiedUsers.map((user) => {
      return {
        key: count++,
        address: user.address,
        twitterHandles: user.twitterHandles,
      };
    });
    setTwitterVerifiedData(data);
  }, [twitterVerifiedUsers]);

  return (
    <Table
      columns={columns}
      dataSource={twitterVerifiedData}
      onChange={handleTableChange}
      {...tableParams}
    />
  );
}
