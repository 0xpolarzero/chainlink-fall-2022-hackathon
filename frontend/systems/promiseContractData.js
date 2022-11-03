import FormattedAddress from '../components/utils/FormattedAddress';

const columns = [
  {
    title: 'Contract address',
    dataIndex: 'contractAddress',
    key: 'contractAddress',
  },
  {
    title: 'IPFS CID',
    dataIndex: 'ipfsCid',
    key: 'ipfsCid',
  },
];

const displayContractData = (contractAddress, ipfsCid) => {
  const contractData = [
    {
      contractAddress: (
        <FormattedAddress address={contractAddress} isShrinked='responsive' />
      ),
      ipfsCid: (
        <FormattedAddress
          address={ipfsCid}
          isShrinked='responsive'
          prefix='https://dweb.link/ipfs/'
        />
      ),
      key: contractAddress,
    },
  ];

  return contractData;
};

export { columns, displayContractData };
