import styles from '../styles/Home.module.css';
import { GET_CHILD_CONTRACT_CREATED } from '../constants/subgraphQueries';
import { useAccount } from 'wagmi';
import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';

export default function userPromises({ setActivePage }) {
  const [userCreatedPromises, setUserCreatedPromises] = useState([]);
  const [userInvolvedPromises, setUserInvolvedPromises] = useState([]);
  const { address, isDisconnected } = useAccount();
  const { data, loading, error } = useQuery(GET_CHILD_CONTRACT_CREATED);

  useEffect(() => {
    setActivePage(2);
  }, []);

  if (isDisconnected) {
    return (
      <main className={styles.main}>
        <section className='section section-user'>
          Please connect your wallet to start interacting with your promises.
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
    console.log(data.childContractCreateds);
    data.childContractCreateds.map((childContract) => {
      // if (childContract.owner === userAddress)
    });

    return (
      <main className={styles.explore}>
        <section className='section section-user'></section>
      </main>
    );
  }
}
