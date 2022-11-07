import styles from '../styles/Home.module.css';
import NewPromiseDrawer from '../components/user/NewPromiseDrawer';
import PromisesCollapse from '../components/PromisesCollapse';
import PromisesCollapseSkeleton from '../components/PromisesCollapseSkeleton';
import PromisesDataContext from '../systems/PromisesDataContext';
import { Pagination } from 'antd';
import { useAccount } from 'wagmi';
import { useContext, useEffect, useState } from 'react';

export default function userPromises({ setActivePage }) {
  const [isDefinitelyConnected, setIsDefinitelyConnected] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userCreatedPromises, setUserCreatedPromises] = useState([]);
  const [userShownCreatedPromises, setUserShownCreatedPromises] = useState([]);
  const [userInvolvedPromises, setUserInvolvedPromises] = useState([]);
  const [userShownInvolvedPromises, setUserShownInvolvedPromises] = useState(
    [],
  );
  const [shownCreatedPage, setShownCreatedPage] = useState(1);
  const [shownInvolvedPage, setShownInvolvedPage] = useState(1);
  const { address: userAddress, isConnected } = useAccount();
  const { fetchPromises, promises, promisesLoading, promisesError } =
    useContext(PromisesDataContext);

  useEffect(() => {
    fetchPromises();
    setActivePage(2);
  }, []);

  useEffect(() => {
    if (isConnected) {
      setIsDefinitelyConnected(true);
    } else {
      setIsDefinitelyConnected(false);
    }
  }, [userAddress]);

  useEffect(() => {
    if (isConnected && !!promises) {
      const sortedPromises = promises.sort((a, b) => b.createdAt - a.createdAt);
      const createdPromises = sortedPromises.filter(
        (promise) => promise.owner.toLowerCase() === userAddress.toLowerCase(),
      );
      // The user should be a party but not the owner
      const involvedPromises = sortedPromises.filter(
        (promise) =>
          promise.owner.toLowerCase() !== userAddress.toLowerCase() &&
          promise.partyAddresses.some(
            (participant) =>
              participant.toLowerCase() === userAddress.toLowerCase(),
          ),
      );

      setUserCreatedPromises(createdPromises);
      setUserInvolvedPromises(involvedPromises);
    }
    // We're adding userAddress so it filters again if the user changes wallet
  }, [promises, promisesLoading, isDefinitelyConnected, userAddress]);

  useEffect(() => {
    if (!!promises && !promisesError) {
      // Show the promises corresponsing to the page
      setUserShownCreatedPromises(
        userCreatedPromises.slice(
          (shownCreatedPage - 1) * 5,
          shownCreatedPage * 5,
        ),
      );

      setUserShownInvolvedPromises(
        userInvolvedPromises.slice(
          (shownInvolvedPage - 1) * 5,
          shownInvolvedPage * 5,
        ),
      );
    }
  }, [
    shownCreatedPage,
    shownInvolvedPage,
    userCreatedPromises,
    userInvolvedPromises,
  ]);

  if (!isDefinitelyConnected) {
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

  if (promisesError) {
    console.log(promisesError);
    return (
      <main className={styles.main}>
        <section className='section section-user'>
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
    <main className={styles.user}>
      <section className='section section-user'>
        <div className='header'>
          <div className='title'>Your promises</div>
          <button
            className='action-btn styled'
            onClick={() => setDrawerOpen(true)}
          >
            New Promise
          </button>
        </div>
        <div className='user-promises owner'>
          <div className='header-sub'>You created:</div>
          <div className='promises-list'>
            {!promises ? (
              <PromisesCollapseSkeleton arraySize={3} />
            ) : !!promises ? (
              userCreatedPromises.length > 0 ? (
                <div className='promises-list-wrapper'>
                  <PromisesCollapse
                    promises={userShownCreatedPromises}
                    context='modifiable'
                  />
                  <Pagination
                    simple
                    defaultCurrent={1}
                    total={userCreatedPromises.length}
                    onChange={(e) => setShownCreatedPage(e)}
                    pageSize={5}
                  />
                </div>
              ) : (
                <div className='no-promises'>
                  You haven't created any promise yet.
                </div>
              )
            ) : (
              'Seems like there was an error loading this section... Please try refreshing.'
            )}
          </div>
        </div>

        <div className='user-promises involved'>
          <div className='header-sub'>You're involved with:</div>
          <div className='promises-list'>
            {!promises ? (
              <PromisesCollapseSkeleton arraySize={3} />
            ) : !!promises ? (
              userInvolvedPromises.length > 0 ? (
                <div className='promises-list-wrapper'>
                  <PromisesCollapse
                    promises={userShownInvolvedPromises}
                    context='modifiable'
                  />
                  <Pagination
                    simple
                    defaultCurrent={1}
                    total={userInvolvedPromises.length}
                    onChange={(e) => setShownInvolvedPage(e)}
                    pageSize={5}
                  />
                </div>
              ) : (
                <div className='no-promises'>
                  You are not involved in any promise yet.
                </div>
              )
            ) : (
              'Seems like there was an error loading this section... Please try refreshing.'
            )}
          </div>
        </div>
        <NewPromiseDrawer
          drawerOpen={drawerOpen}
          setDrawerOpen={setDrawerOpen}
        />
      </section>
    </main>
  );
}
