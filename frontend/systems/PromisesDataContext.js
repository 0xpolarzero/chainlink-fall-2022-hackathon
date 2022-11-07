import { GET_ACTIVE_PROMISE } from '../constants/subgraphQueries';
import { useLazyQuery } from '@apollo/client';
import { createContext, useState } from 'react';

const PromisesDataContext = createContext();

export const PromisesDataProvider = ({ children }) => {
  const [promises, setPromises] = useState(null);
  const [
    fetchPromises,
    { error: promisesError, loading: promisesLoading, refetch },
  ] = useLazyQuery(GET_ACTIVE_PROMISE, {
    onCompleted: (data) => {
      setPromises(data.activePromises);
    },
    fetchPolicy: 'network-only',
  });

  const reFetchPromises = async () => {
    await new Promise((resolve) => {
      refetch().then((res) => {
        resolve();
        setPromises(res.data.activePromises);
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
      }}
    >
      {children}
    </PromisesDataContext.Provider>
  );
};

export default PromisesDataContext;
