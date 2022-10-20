import styles from '../styles/Home.module.css';
import PromisesCollapse from '../components/PromisesCollapse';
import PromisesCollapseSkeleton from '../components/PromisesCollapseSkeleton';
import { GET_CHILD_CONTRACT_CREATED } from '../constants/subgraphQueries';
import { useAccount } from 'wagmi';
import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';

export default function userPromises({ setActivePage }) {
  const [userCreatedPromises, setUserCreatedPromises] = useState([]);
  const [userInvolvedPromises, setUserInvolvedPromises] = useState([]);
  const { address: userAddress, isDisconnected } = useAccount();
  const { data, loading, error } = useQuery(GET_CHILD_CONTRACT_CREATED);

  useEffect(() => {
    setActivePage(2);
  }, []);

  useEffect(() => {
    if (!isDisconnected && !!data) {
      const promises = data.childContractCreateds;
      const createdPromises = promises.filter(
        (promise) => promise.owner.toLowerCase() === userAddress.toLowerCase(),
      );
      const involvedPromises = promises.filter((promise) =>
        promise.partyAddresses
          .map((address) => address.toLowerCase())
          .includes(userAddress.toLowerCase()),
      );
      setUserCreatedPromises(createdPromises);
      setUserInvolvedPromises(involvedPromises);
    }
    // We're adding userAddress so it filters again if the user changes wallet
  }, [data, userAddress]);

  if (isDisconnected) {
    return (
      <main className={styles.main}>
        <section className='section section-user'>
          <div className='error-container'>
            <span className='error'>
              Please connect your wallet to start interacting with your
              promises.
            </span>
          </div>
        </section>
      </main>
    );
  }

  if (loading) {
    console.log('loading');
    return (
      <main className={styles.main}>
        <section className='section section-user'>LOADING</section>
      </main>
    );
  }

  if (error) {
    console.log(error);
    return (
      <main className={styles.main}>
        <section className='section section-user'>ERROR</section>
      </main>
    );
  }

  if (!!data) {
    return (
      <main className={styles.user}>
        <section className='section section-user'>
          <div className='user-promises owner'>
            <div className='header'>Promises you created</div>
            <div className='promises-list'>
              {userCreatedPromises.length > 0 ? (
                <PromisesCollapse promises={userCreatedPromises} />
              ) : (
                <div className='no-promises'>
                  You haven't created any promises yet.
                </div>
              )}
            </div>
          </div>
          <div className='user-promises involved'></div>
        </section>
      </main>
    );
  }
}
