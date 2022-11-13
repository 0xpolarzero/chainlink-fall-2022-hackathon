import styles from '../styles/modules/Home.module.css';
import VerifyTwitterDrawer from '../components/user-dashboard/VerifyTwitterDrawer';
import TwitterVerifiedTable from '../components/explore-twitter/TwitterVerifiedTable';
import TwitterVerifiedTableSkeleton from '../components/explore-twitter/TwitterVerifiedTableSkeleton';
import PromisesDataContext from '../systems/context/PromisesDataContext';
import { Button, Tooltip } from 'antd';
import { useContext, useEffect, useState } from 'react';

export default function exploreTwitterVerified({ setActivePage }) {
  const [sortedTwitterVerifiedUsers, setSortedTwitterVerifiedUsers] = useState(
    [],
  );
  const [isVerifyTwitterDrawerOpen, setIsVerifyTwitterDrawerOpen] =
    useState(false);

  const {
    fetchTwitterVerifiedUsers,
    twitterVerifiedUsers,
    twitterVerifiedUsersError,
  } = useContext(PromisesDataContext);

  useEffect(() => {
    setActivePage(2);
    fetchTwitterVerifiedUsers();
  }, []);

  useEffect(() => {
    if (!!twitterVerifiedUsers && !twitterVerifiedUsersError) {
      // Sort the promises by the number of promises
      const sortedTwitterVerified = twitterVerifiedUsers.sort(
        (a, b) => b.verifiedAt - a.verifiedAt,
      );
      setSortedTwitterVerifiedUsers(sortedTwitterVerified);
    }
  }, [twitterVerifiedUsers]);

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
      <section className='section section-explore-twitter'>
        <div className='header'>
          <div className='title'> Verified Twitter handles</div>
          <Tooltip
            title={
              <div>
                You can verifiy a Twitter handle for the Ethereum address you're
                connected with.
                <br /> <br />
                <b>
                  <i className='fas fa-warning' /> Warning:
                </b>{' '}
                You won't be able to remove an associated Twitter handle once
                it's verified.
              </div>
            }
          >
            <Button
              type='primary'
              className='action-btn'
              onClick={() => setIsVerifyTwitterDrawerOpen(true)}
            >
              Verify a Twitter handle
            </Button>
          </Tooltip>
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
              <div className='twitter-verified-table'>
                <TwitterVerifiedTable
                  twitterVerifiedUsers={sortedTwitterVerifiedUsers}
                />
              </div>
            )
          ) : (
            'Seems like there was an error loading this page... Please try refreshing.'
          )}
        </div>
        <VerifyTwitterDrawer
          isDrawerOpen={isVerifyTwitterDrawerOpen}
          setIsDrawerOpen={setIsVerifyTwitterDrawerOpen}
        />
      </section>
    </main>
  );
}
