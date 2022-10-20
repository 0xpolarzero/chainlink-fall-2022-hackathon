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

  if (error) {
    console.log(error);
    return (
      <main className={styles.main}>
        <section className='section section-explore'>ERROR</section>
      </main>
    );
  }

  return (
    <main className={styles.explore}>
      <section className='section section-explore'>
        <div className='header'>Recent promises</div>
        <div className='promises-list'>
          {loading ? (
            <PromisesCollapseSkeleton arraySize={3} />
          ) : !!data ? (
            <PromisesCollapse promises={data.childContractCreateds} />
          ) : (
            'Seems like there was an error loading this page... Please try refreshing.'
          )}
        </div>
      </section>
    </main>
  );
}
