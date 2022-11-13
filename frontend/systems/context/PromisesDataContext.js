import {
  GET_ACTIVE_PROMISE,
  GET_TWITTER_VERIFIED_USER,
} from '../../constants/subgraphQueries';
import { useLazyQuery } from '@apollo/client';
import { createContext, useState } from 'react';

const PromisesDataContext = createContext();

export const PromisesDataProvider = ({ children }) => {
  const [promises, setPromises] = useState(null);
  const [twitterVerifiedUsers, setTwitterVerifiedUsers] = useState(null);

  const [
    fetchPromises,
    {
      error: promisesError,
      loading: promisesLoading,
      refetch: refetchPromises,
    },
  ] = useLazyQuery(GET_ACTIVE_PROMISE, {
    onCompleted: (data) => {
      setPromises(data.activePromises);
    },
    fetchPolicy: 'network-only',
  });

  const [
    fetchTwitterVerifiedUsers,
    {
      error: twitterVerifiedUsersError,
      loading: twitterVerifiedUsersLoading,
      refetch: refetchTwitterVerifiedUsers,
    },
  ] = useLazyQuery(GET_TWITTER_VERIFIED_USER, {
    onCompleted: (data) => {
      setTwitterVerifiedUsers(data.twitterVerifiedUsers);
    },
    fetchPolicy: 'network-only',
  });

  const reFetchPromises = async () => {
    await new Promise((resolve) => {
      refetchPromises().then((res) => {
        resolve();
        setPromises(res.data.activePromises);
      });
    });
  };

  const reFetchTwitterVerifiedUsers = async () => {
    await new Promise((resolve) => {
      refetchTwitterVerifiedUsers().then((res) => {
        resolve();
        setTwitterVerifiedUsers(res.data.twitterVerifiedUsers);
      });
    });
  };

  return (
    <PromisesDataContext.Provider
      value={{
        fetchPromises,
        reFetchPromises,
        promises,
        promisesLoading,
        promisesError,
        fetchTwitterVerifiedUsers,
        reFetchTwitterVerifiedUsers,
        twitterVerifiedUsers,
        twitterVerifiedUsersLoading,
        twitterVerifiedUsersError,
      }}
    >
      {children}
    </PromisesDataContext.Provider>
  );
};

export default PromisesDataContext;
