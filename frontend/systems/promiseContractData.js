import FormattedAddress from '../components/utils/FormattedAddress';

const columns = [
  {
    title: 'Contract address',
    dataIndex: 'contractAddress',
    key: 'contractAddress',
  },
  {
    title: 'PDF URI',
    dataIndex: 'pdfUri',
    key: 'pdfUri',
  },
];

const displayContractData = (contractAddress, pdfUri) => {
  const contractData = [
    {
      contractAddress: (
        <FormattedAddress address={contractAddress} isShrinked='responsive' />
      ),
      pdfUri,
    },
  ];

  return contractData;
};

export { columns, displayContractData };
