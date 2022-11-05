import { gql } from '@apollo/client';

const GET_ACTIVE_PROMISE = gql`
  {
    activePromises(first: 1000) {
      id
      owner
      contractAddress
      promiseName
      ipfsCid
      partyNames
      partyTwitterHandles
      partyAddresses
      createdAt
      updatedAt
    }
  }
`;

export { GET_ACTIVE_PROMISE };
