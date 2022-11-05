import styles from '../styles/Home.module.css';
import PromisesCollapse from '../components/PromisesCollapse';
import PromisesCollapseSkeleton from '../components/PromisesCollapseSkeleton';
import { GET_ACTIVE_PROMISE } from '../constants/subgraphQueries';
import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { AutoComplete, Pagination, Tooltip } from 'antd';

export default function explorePromises({ setActivePage }) {
  const [shownPage, setShownPage] = useState(1);
  const [shownPromises, setShownPromises] = useState([]);
  const [sortedPromises, setSortedPromises] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [searchOptions, setSearchOptions] = useState([]);
  const { data, loading, error } = useQuery(GET_ACTIVE_PROMISE);

  // SEARCHING ----------------------------------------------
  const handleSearch = (e) => {
    if (e.type === 'keydown' && e.key !== 'Enter') return;

    // Show the promises corresponding to the search value
    if (!!data && searchValue !== '') {
      const filteredPromises = sortedPromises.filter(
        (promise) =>
          promise.promiseName
            .toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          promise.partyNames.some((name) =>
            name.toLowerCase().includes(searchValue.toLowerCase()),
          ) ||
          promise.partyAddresses.some((address) =>
            address.toLowerCase().includes(searchValue.toLowerCase()),
          ) ||
          promise.partyTwitterHandles.some((handle) =>
            handle.toLowerCase().includes(searchValue.toLowerCase()),
          ),
      );
      setShownPromises(filteredPromises);
      // ... but get it back if the user deletes the search
    } else if (!!data) {
      setShownPromises(
        sortedPromises.slice((shownPage - 1) * 5, shownPage * 5),
      );
    }
  };
  // --------------------------------------------------------

  useEffect(() => {
    setActivePage(1);

    // Put all the promises names in the search options with a unique key
    if (!!data && !loading && !error) {
      const promisesNames = sortedPromises.map((promise) => ({
        value: promise.promiseName,
      }));
      setSearchOptions(promisesNames);
    }
  }, [sortedPromises]);

  useEffect(() => {
    // Sort the promises by blockTimestamp
    if (!!data && !loading && !error) {
      const sorted = data.activePromises.sort(
        (a, b) => b.blockTimestamp - a.blockTimestamp,
      );
      setSortedPromises(sorted);
      setShownPromises(sorted.slice((shownPage - 1) * 5, shownPage * 5));
    }
  }, [shownPage, loading]);

  if (error) {
    console.log(error);
    return (
      <main className={styles.main}>
        <section className='section section-explore'>
          <div className='error-container'>
            <div className='error'>
              There was an error fetching data for this page. Please try to
              reload.
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.explore}>
      <section className='section section-explore'>
        <div className='header'>
          <div className='title'> Recent promises</div>
          <AutoComplete
            options={searchOptions}
            style={{ width: '100%' }}
            placeholder='Search an address, a promise name, a Twitter handle...'
            filterOption={(inputValue, option) =>
              option.value.toLowerCase().indexOf(inputValue.toLowerCase()) !==
              -1
            }
            onChange={(e) => setSearchValue(e)}
            onKeyDown={handleSearch}
            allowClear={true}
            clearIcon={<i className='fas fa-trash'></i>}
            onClear={() =>
              setShownPromises(
                sortedPromises.slice((shownPage - 1) * 5, shownPage * 5),
              )
            }
          />
        </div>
        <div className='promises-list'>
          {loading ? (
            <PromisesCollapseSkeleton arraySize={3} />
          ) : !!data ? (
            data.activePromises.length === 0 ? (
              <div className='error-container'>
                There are no promises yet. Be the first to create one!
              </div>
            ) : (
              <div className='promises-list-wrapper'>
                <PromisesCollapse promises={shownPromises} context='explore' />
                <Pagination
                  simple
                  defaultCurrent={1}
                  total={data.activePromises.length}
                  onChange={(e) => setShownPage(e)}
                  pageSize={5}
                />
              </div>
            )
          ) : (
            'Seems like there was an error loading this page... Please try refreshing.'
          )}
        </div>
      </section>
    </main>
  );
}
