import { GET_ACTIVE_PROMISE } from '../constants/subgraphQueries';
import { useLazyQuery } from '@apollo/client';
import { createContext, useState } from 'react';

const PromisesDataContext = createContext();

export const PromisesDataProvider = ({ children }) => {
  const [promises, setPromises] = useState(null);
  const [fetch, { error: promisesError, loading: promisesLoading, refetch }] =
    useLazyQuery(GET_ACTIVE_PROMISE, {
      onCompleted: (data) => {
        console.log(
          'FROM PROVIDER: ',
          data.activePromises[0].partyNames.length,
        );
        setPromises(data.activePromises);
      },
      fetchPolicy: 'network-only',
    });

  const fetchPromises = () => {
    // Wait for 10s before fetching the data
    fetch();
    // .then((res) => {
    //   console.log(res.data.activePromises);
    //   setPromises(res.data.activePromises);
    // })
    // .catch((err) => {
    //   console.log(err);
    // });
  };

  const reFetchPromises = () => {
    // Wait for 5s before fetching the data

    // Return a promise when it's done so we can chain it after it's been updated
    return new Promise((resolve) => {
      setTimeout(() => {
        refetch();
        resolve();
      }, 5000);
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
