import styles from '../styles/Home.module.css';
import TwitterVerifiedTable from '../components/explore/TwitterVerifiedTable';
import TwitterVerifiedTableSkeleton from '../components/explore/TwitterVerifiedTableSkeleton';
import PromisesDataContext from '../systems/PromisesDataContext';
import { useContext, useEffect, useState } from 'react';
import { AutoComplete, Pagination } from 'antd';

const twitterVerifiedUsers = [
  {
    address: '0x0000000000000000000000000000000000000000',
    twitterHandles: ['elonmusk'],
  },
  {
    address: '0x0000000000000000000000000000000000000000',
    twitterHandles: ['jack', 'j4ck'],
  },
  {
    address: '0x0000000000000000000000000000000000000000',
    twitterHandles: ['eric'],
  },
];
let twitterVerifiedUsersError;

export default function exploreTwitterVerified({ setActivePage }) {
  const [shownPage, setShownPage] = useState(1);
  const [shownTwitterVerified, setShownTwitterVerified] = useState([]);
  const [sortedTwitterVerified, setSortedTwitterVerified] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [searchOptions, setSearchOptions] = useState([]);

  //   const {
  //     fetchTwitterVerifiedUsers,
  //     twitterVerifiedUsers,
  //     twitterVerifiedUsersError,
  //   } = useContext(PromisesDataContext);

  // SEARCHING ----------------------------------------------
  const handleSearch = (e) => {
    if (e.type === 'keydown' && e.key !== 'Enter') return;

    // Show the twitterVerified corresponding to the search value
    if (!!twitterVerifiedUsers && searchValue !== '') {
      const filteredTwitterVerified = twitterVerifiedUsers.filter(
        (twitterVerified) =>
          twitterVerified.twitterHandles.map((handle) =>
            handle.toLowerCase().includes(searchValue.toLowerCase()),
          ) ||
          twitterVerified.address
            .toLowerCase()
            .includes(searchValue.toLowerCase()),
      );
      setShownTwitterVerified(filteredTwitterVerified);
      // ... but get it back if the user deletes the search
    } else if (!!twitterVerifiedUsers) {
      setShownTwitterVerified(
        sortedTwitterVerified.slice((shownPage - 1) * 5, shownPage * 5),
      );
    }
  };
  // --------------------------------------------------------

  useEffect(() => {
    setActivePage(1);
    // fetchTwitterVerifiedUsers();
  });

  useEffect(() => {
    // Map through the users and add all their handles to the search options
    if (!!twitterVerifiedUsers && !twitterVerifiedUsersError) {
      // Map through the users, then map through their handles and add each one to the search options
      let options = [];
      const twitterVerifiedHandles = twitterVerifiedUsers.map((user) =>
        user.twitterHandles.map((handle) => options.push({ value: handle })),
      );
      console.log(options);
      setSearchOptions(options);
    }
  }, [twitterVerifiedUsers]);

  useEffect(() => {
    if (!!twitterVerifiedUsers && !twitterVerifiedUsersError) {
      // Sort the promises by the number of promises
      const sortedTwitterVerified = twitterVerifiedUsers.sort(
        (a, b) => b.verifiedAt - a.verifiedAt,
      );
      setSortedTwitterVerified(sortedTwitterVerified);
      // Show the first 5 handles
      setShownTwitterVerified(
        sortedTwitterVerified.slice((shownPage - 1) * 5, shownPage * 5),
      );
    }
  }, [shownPage, twitterVerifiedUsers]);

  if (twitterVerifiedUsersError) {
    console.log(twitterVerifiedUsersError);
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
          <div className='title'> Verified Twitter handles</div>
          <AutoComplete
            options={searchOptions}
            style={{ width: '100%' }}
            placeholder='Search an address or a Twitter handle...'
            filterOption={(inputValue, option) =>
              option.value.toLowerCase().indexOf(inputValue.toLowerCase()) !==
              -1
            }
            onChange={(e) => setSearchValue(e)}
            onKeyDown={handleSearch}
            allowClear={true}
            clearIcon={<i className='fas fa-trash'></i>}
            onClear={() =>
              setShownTwitterVerified(
                sortedTwitterVerified.slice((shownPage - 1) * 5, shownPage * 5),
              )
            }
          />
        </div>
        <div className='twitter-verified-container'>
          {!twitterVerifiedUsers ? (
            <TwitterVerifiedTableSkeleton />
          ) : !!twitterVerifiedUsers ? (
            twitterVerifiedUsers.length === 0 ? (
              <div className='error-container'>
                There are no verified users yet. Be the first to verify your
                Twitter handle!
              </div>
            ) : (
              <div className='promises-list-wrapper'>
                <TwitterVerifiedTable
                  twitterVerifiedUsers={shownTwitterVerified}
                />
                <Pagination
                  simple
                  defaultCurrent={1}
                  total={twitterVerifiedUsers.length}
                  onChange={(e) => setShownPage(e)}
                  pageSize={1}
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
