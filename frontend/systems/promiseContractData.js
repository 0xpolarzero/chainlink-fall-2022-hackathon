import FormattedAddress from '../components/utils/FormattedAddress';
import { Tooltip } from 'antd';

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
  const isCidValid = checkCidFormat(ipfsCid);
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
        <>
          <FormattedAddress
            address={ipfsCid}
            isShrinked='responsive'
            type='ipfs'
          />
          {!isCidValid && (
            <Tooltip
              title={
                <span>
                  This is not a valid IPFS CID. Please check the{' '}
                  <a
                    href='https://docs.ipfs.io/concepts/content-addressing/'
                    target='_blank'
                  >
                    IPFS documentation
                  </a>{' '}
                  for more information.
                </span>
              }
            >
              {' '}
              <i
                className='fas fa-warning'
                style={{ color: 'var(--toastify-color-warning)' }}
              />
            </Tooltip>
          )}
        </>
      ),
      key: contractAddress,
    },
  ];

  return contractData;
};

const checkCidFormat = (cid) => {
  const cidRegex = new RegExp(
    '^(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})$',
  );
  return cidRegex.test(cid);
};

export { columns, displayContractData };
