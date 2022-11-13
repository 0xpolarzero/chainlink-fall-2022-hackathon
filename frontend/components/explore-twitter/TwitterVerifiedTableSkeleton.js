import { Skeleton, Table } from 'antd';

export default function TwitterVerifiedTableSkeleton() {
  return (
    <Table
      columns={[
        {
          title: 'Address',
          dataIndex: 'address',
          key: 'address',
        },
        {
          title: 'Twitter handles',
          dataIndex: 'twitterHandles',
          key: 'twitterHandles',
        },
      ]}
      dataSource={Array(10)
        .fill()
        .map((_, i) => ({
          key: i,
          address: <Skeleton active title={false} paragraph={{ rows: 1 }} />,
          twitterHandles: (
            <Skeleton active title={false} paragraph={{ rows: 1 }} />
          ),
        }))}
    />
  );
}
