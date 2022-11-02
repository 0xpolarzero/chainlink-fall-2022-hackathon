import { formatSize } from '../../systems/utils';
import { Table } from 'antd';
import { useEffect, useState } from 'react';

export default function IpfsDisplaydirectory({ link, content }) {
  const [tableData, setTableData] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 5,
      position: ['topRight'],
    },
  });

  const handleTableChange = (pagination) => {
    setTableParams({
      pagination,
    });
  };

  useEffect(() => {
    setTableData(
      content.map((item) => {
        return {
          name: item.Name,
          hash: item.Hash,
          size: item.Type === 2 ? formatSize(item.Size) : 'Folder',
          key: item.Hash,
        };
      }),
    );
  }, []);

  console.log(content);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Hash',
      dataIndex: 'hash',
      key: 'hash',
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
    },
  ];

  return (
    <div className='ipfs-display'>
      <Table
        title={() => <b>IPFS directory</b>}
        dataSource={tableData}
        columns={columns}
        pagination={tableParams.pagination}
        onChange={handleTableChange}
      />
      {/* <iframe
        src={link}
        title='IPFS'
        style={{ width: '100%', height: '100%', minHeight: '300px' }}
      /> */}
    </div>
  );
}
