import styles from '../styles/Home.module.css';
import { GET_CHILD_CONTRACT_CREATED } from '../constants/subgraphQueries';
import { useQuery } from '@apollo/client';
import { useEffect } from 'react';

export default function explorePromises({ setActivePage }) {
  const { data, loading, error } = useQuery(GET_CHILD_CONTRACT_CREATED);

  useEffect(() => {
    setActivePage(1);
  }, []);

  useEffect(() => {
    let interval = setInterval(() => {
      console.log(loading);
    }, 1000);
    return () => clearInterval(interval);
  }, [loading]);

  if (loading) {
    console.log('loading');
    return (
      <main className={styles.main}>
        <section className='section section-explore'>LOADING</section>
      </main>
    );
  }

  if (error) {
    console.log(error);
    return (
      <main className={styles.main}>
        <section className='section section-explore'>ERROR</section>
      </main>
    );
  }

  if (!!data) {
    console.log(data);
    return (
      <main className={styles.main}>
        <section className='section section-explore'>
          {data.childContractCreateds.map((childContract) => {
            return (
              <div key={childContract.id}>
                <div>{childContract.agreementName}</div>
                <div>{childContract.contractAddress}</div>
                <div>{childContract.owner}</div>
                <div>{childContract.pdfUri}</div>
                <div>{childContract.partyNames}</div>
                <div>{childContract.partyTwitterHandles}</div>
                <div>{childContract.partyAddresses}</div>
              </div>
            );
          })}
        </section>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <section className='section section-explore'>
        Seems like there was an error loading this page... Please try
        refreshing.
      </section>
    </main>
  );
}
