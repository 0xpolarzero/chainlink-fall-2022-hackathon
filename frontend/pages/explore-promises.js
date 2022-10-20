import styles from '../styles/Home.module.css';
import PromisesCollapse from '../components/PromisesCollapse';
import PromisesCollapseSkeleton from '../components/PromisesCollapseSkeleton';
import { GET_CHILD_CONTRACT_CREATED } from '../constants/subgraphQueries';
import { useQuery } from '@apollo/client';
import { useEffect } from 'react';

export default function explorePromises({ setActivePage }) {
  const { data, loading, error } = useQuery(GET_CHILD_CONTRACT_CREATED);

  useEffect(() => {
    setActivePage(1);
  }, []);

  if (loading) {
    return (
      <main className={styles.main}>
        <section className='section section-explore'>
          <div className='header'>Recent promises</div>
          <div className='promises-list'>
            <PromisesCollapseSkeleton arraySize={5} />
          </div>
        </section>
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
    return (
      <main className={styles.explore}>
        <section className='section section-explore'>
          <div className='header'>Recent promises</div>
          <div className='promises-list'>
            <PromisesCollapse promises={data.childContractCreateds} />
          </div>
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
