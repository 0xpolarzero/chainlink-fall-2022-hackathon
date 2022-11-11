import { gql } from '@apollo/client';

const GET_ACTIVE_PROMISE = gql`
  {
    activePromises(first: 1000) {
      id
      owner
      contractAddress
      promiseName
      ipfsCid
      arweaveId
      partyNames
      partyTwitterHandles
      partyAddresses
      createdAt
      updatedAt
    }
  }
`;

const GET_TWITTER_VERIFIED_USER = gql`
  {
    twitterVerifiedUsers(first: 1000) {
      id
      address
      twitterHandles
      verifiedAt
    }
  }
`;

export { GET_ACTIVE_PROMISE, GET_TWITTER_VERIFIED_USER };
