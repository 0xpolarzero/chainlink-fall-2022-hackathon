import styles from '../styles/Home.module.css';
import PromisesCollapse from '../components/PromisesCollapse';
import PromisesCollapseSkeleton from '../components/PromisesCollapseSkeleton';
import { GET_CHILD_CONTRACT_CREATED } from '../constants/subgraphQueries';
import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { AutoComplete, Pagination, Tooltip } from 'antd';

export default function explorePromises({ setActivePage }) {
  const [shownPage, setShownPage] = useState(1);
  const [shownPromises, setShownPromises] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [searchOptions, setSearchOptions] = useState([]);
  const { data, loading, error } = useQuery(GET_CHILD_CONTRACT_CREATED);

  const handleSearch = (e) => {
    if (e.type === 'keydown' && e.key !== 'Enter') return;

    // Show the promises corresponding to the search value
    if (!!data && searchValue !== '') {
      const filteredPromises = data.childContractCreateds.filter(
        (promise) =>
          promise.agreementName
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
        data.childContractCreateds.slice((shownPage - 1) * 10, shownPage * 10),
      );
    }
  };

  useEffect(() => {
    setActivePage(1);

    // Put all the promises names in the search options with a unique key
    if (!!data && !loading && !error) {
      const promisesNames = data.childContractCreateds.map((promise) => ({
        value: promise.agreementName,
      }));
      setSearchOptions(promisesNames);
    }
  }, [loading]);

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
        <div className='header'>
          <div className='title'> Recent promises</div>
          <AutoComplete
            options={searchOptions}
            style={{ width: '100%' }}
            placeholder='Search an address (ENS, Ethereum), a promise name, a Twitter handle...'
            filterOption={(inputValue, option) =>
              option.value.toLowerCase().indexOf(inputValue.toLowerCase()) !==
              -1
            }
            onChange={(e) => setSearchValue(e)}
            onKeyDown={handleSearch}
            allowClear={true}
            clearIcon={<i className='fa-solid fa-trash'></i>}
            onClear={() =>
              setShownPromises(
                data.childContractCreateds.slice(
                  (shownPage - 1) * 10,
                  shownPage * 10,
                ),
              )
            }
          />
        </div>
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