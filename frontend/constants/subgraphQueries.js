import { gql } from '@apollo/client';

const GET_CHILD_CONTRACT_CREATED = gql`
  {
    childContractCreateds(first: 1000) {
      id
      owner
      contractAddress
      agreementName
      pdfUri
      partyNames
      partyTwitterHandles
      partyAddresses
    }
  }
`;

export { GET_CHILD_CONTRACT_CREATED };
