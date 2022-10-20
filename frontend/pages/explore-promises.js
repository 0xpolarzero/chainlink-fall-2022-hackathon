import styles from '../styles/Home.module.css';
import PromisesCollapse from '../components/PromisesCollapse';
import PromisesCollapseSkeleton from '../components/PromisesCollapseSkeleton';
import { GET_CHILD_CONTRACT_CREATED } from '../constants/subgraphQueries';
import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { Pagination } from 'antd';

export default function explorePromises({ setActivePage }) {
  const [shownPage, setShownPage] = useState(1);
  const [shownPromises, setShownPromises] = useState([]);
  const { data, loading, error } = useQuery(GET_CHILD_CONTRACT_CREATED);

  useEffect(() => {
    setActivePage(1);
  }, []);

  useEffect(() => {
    // Get the shown page and show relevant set of promises, 10 per page
    if (!!data && !loading && !error) {
      setShownPromises(
        data.childContractCreateds.slice((shownPage - 1) * 10, shownPage * 10),
      );
    }
  }, [shownPage, loading]);

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
            <div className='promises-list-wrapper'>
              <PromisesCollapse promises={shownPromises} />
              <Pagination
                simple
                defaultCurrent={1}
                total={data.childContractCreateds.length}
                onChange={(e) => setShownPage(e)}
              />
            </div>
          ) : (
            'Seems like there was an error loading this page... Please try refreshing.'
          )}
        </div>
      </section>
    </main>
  );
}
