import { getContentFromCid } from '../../systems/getContentFromCid';
import { formatSize } from '../../systems/utils';
import { Skeleton, Table } from 'antd';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import FormattedAddress from '../utils/FormattedAddress';

export default function IpfsDisplaydirectory({
  link,
  originalContent,
  baseCid,
}) {
  const [tableData, setTableData] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 5,
      position: ['topRight'],
    },
  });
  const [path, setPath] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleTableChange = (pagination) => {
    setTableParams({
      pagination,
    });
  };

  const setContent = (input) => {
    setTableData(
      input.map((item) => {
        return {
          name: item.Name,
          hash: item.Hash,
          // TODO NO LINK
          formattedHash: (
            <FormattedAddress
              address={item.Hash}
              isShrinked={true}
              prefix='https://dweb.link/ipfs/'
            />
          ),
          size: item.Type === 2 ? formatSize(item.Size) : 'Directory',
          type: item.Type === 2 ? 'file' : 'directory',
          key: item.Hash,
        };
      }),
    );
  };

  const openDirectory = (record) => {
    const fullPath = path.join('/') + '/' + record.name;
    // If it's a directory
    if (record.type === 'directory') {
      // Add the name to the path
      setPath([...path, record.name]);
      setIsLoading(true);
      // Set the table data to the new directory
      getContentFromCid(`${baseCid}/${fullPath}`)
        .then((data) => {
          setContent(data.content);
          setIsLoading(false);
        })
        .catch((err) => {
          homeDirectory();
          console.log(err);
          toast.error('There was an error fetching the directory');
          setIsLoading(false);
        });
    } else {
      // Just open the file
      window.open(`${link}${fullPath}`);
    }
  };

  const backDirectory = () => {
    // Get the hash from the last directory in the path and fetch its content
    // If the path is empty, go back to the original content
    if (path.length === 1) {
      homeDirectory();
    } else {
      setIsLoading(true);
      // For the path again without the last item
      const fullPath = path.slice(0, path.length - 1).join('/');
      getContentFromCid(`${baseCid}/${fullPath}`)
        .then((data) => {
          setContent(data.content);
          // Remove the last directory from the path
          setPath(path.slice(0, path.length - 1));
          setTableParams({
            pagination: {
              current: 1,
            },
          });
          setIsLoading(false);
        })
        .catch((err) => {
          homeDirectory();
          console.log(err);
          toast.error('There was an error fetching the directory');
          setIsLoading(false);
        });
    }
  };

  const homeDirectory = () => {
    setContent(originalContent);
    setPath([]);
    setTableParams({
      pagination: {
        current: 1,
      },
    });
  };

  useEffect(() => {
    setContent(originalContent);
  }, []);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Hash',
      dataIndex: 'formattedHash',
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
      {isLoading ? (
        <TableSkeleton
          columns={columns}
          rowCount={tableParams.pagination.pageSize}
        />
      ) : (
        <Table
          title={() => <b>IPFS directory</b>}
          dataSource={tableData}
          columns={columns}
          pagination={tableParams.pagination}
          onChange={handleTableChange}
          onRow={(record, rowIndex) => {
            return {
              onClick: () => {
                openDirectory(record);
              }, // click row
            };
          }}
        />
      )}
      {!isLoading && path.length > 0 && (
        <div className='action-directory'>
          <div className='home-directory' onClick={homeDirectory}>
            <i className='fas fa-home'></i>
          </div>
          <div className='back-directory' onClick={backDirectory}>
            <i className='fas fa-arrow-left'></i>
          </div>
        </div>
      )}
    </div>
  );
}

const TableSkeleton = ({ columns, rowCount }) => {
  return (
    <Table
      title={() => <b>IPFS directory</b>}
      pagination={false}
      dataSource={[...Array(rowCount)].map((_, index) => ({
        key: `key-${index}`,
      }))}
      columns={columns.map((column) => {
        return {
          ...column,
          render: function renderPlaceholder() {
            return (
              <Skeleton
                active
                key={column.dataIndex}
                title={false}
                paragraph={{ rows: 1 }}
              />
            );
          },
        };
      })}
    />
  );
};
