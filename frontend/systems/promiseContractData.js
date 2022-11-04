import { Tooltip } from 'antd';
import FormattedAddress from '../components/utils/FormattedAddress';

const columns = [
  {
    // Add a title with a tooltip
    title: () => {
      return (
        <>
          Contract address{' '}
          <Tooltip title='The address of the smart contract created to hold this promise data.'>
            <i className='fas fa-question-circle' />
          </Tooltip>
        </>
      );
    },

    dataIndex: 'contractAddress',
    key: 'contractAddress',
  },
  {
    title: () => {
      return (
        <>
          IPFS CID{' '}
          <Tooltip
            title={
              <span>
                The unique identifier of the promise data stored on{' '}
                <a
                  href='https://docs.ipfs.tech/concepts/what-is-ipfs/'
                  target='_blank'
                >
                  IPFS
                </a>
              </span>
            }
          >
            <i className='fas fa-question-circle' />
          </Tooltip>
        </>
      );
    },
    dataIndex: 'ipfsCid',
    key: 'ipfsCid',
  },
];

const displayContractData = (contractAddress, ipfsCid) => {
  const contractData = [
    {
      contractAddress: (
        <FormattedAddress
          address={contractAddress}
          isShrinked='responsive'
          type='eth'
        />
      ),
      ipfsCid: (
        <FormattedAddress
          address={ipfsCid}
          isShrinked='responsive'
          type='ipfs'
        />
      ),
      key: contractAddress,
    },
  ];

  return contractData;
};

export { columns, displayContractData };
