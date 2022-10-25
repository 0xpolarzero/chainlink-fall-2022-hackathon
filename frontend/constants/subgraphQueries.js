import { gql } from '@apollo/client';

const GET_CHILD_CONTRACT_CREATED = gql`
  {
    promiseContractCreateds(first: 1000) {
      id
      owner
      contractAddress
      promiseName
      pdfUri
      partyNames
      partyTwitterHandles
      partyAddresses
      blockTimestamp
    }
  }
`;

export { GET_CHILD_CONTRACT_CREATED };
