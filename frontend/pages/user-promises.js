import styles from '../styles/Home.module.css';
import PromiseDrawer from '../components/PromiseDrawer';
import PromisesCollapseModifiable from '../components/PromisesCollapseModifiable';
import PromisesCollapseSkeleton from '../components/PromisesCollapseSkeleton';
import { GET_CHILD_CONTRACT_CREATED } from '../constants/subgraphQueries';
import { Pagination } from 'antd';
import { useAccount } from 'wagmi';
import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';

export default function userPromises({ setActivePage }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userCreatedPromises, setUserCreatedPromises] = useState([]);
  const [userShownCreatedPromises, setUserShownCreatedPromises] = useState([]);
  const [userInvolvedPromises, setUserInvolvedPromises] = useState([]);
  const [userShownInvolvedPromises, setUserShownInvolvedPromises] = useState(
    [],
  );
  const [shownCreatedPage, setShownCreatedPage] = useState(1);
  const [shownInvolvedPage, setShownInvolvedPage] = useState(1);
  const { address: userAddress, isDisconnected } = useAccount();
  const { data, loading, error } = useQuery(GET_CHILD_CONTRACT_CREATED);

  useEffect(() => {
    setActivePage(2);
  }, []);

  useEffect(() => {
    if (!isDisconnected && !!data) {
      const promises = data.childContractCreateds;
      const createdPromises = promises.filter(
        (promise) => promise.owner.toLowerCase() === userAddress.toLowerCase(),
      );
      // The user should be a party but not the owner
      const involvedPromises = promises.filter(
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
  }, [data, userAddress]);

  useEffect(() => {
    if (!!data && !loading && !error) {
      console.log(userCreatedPromises);
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

  if (isDisconnected) {
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

  if (error) {
    console.log(error);
    return (
      <main className={styles.main}>
        <section className='section section-user'>ERROR</section>
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
            {loading ? (
              <PromisesCollapseSkeleton arraySize={3} />
            ) : !!data ? (
              userCreatedPromises.length > 0 ? (
                <div className='promises-list-wrapper'>
                  <PromisesCollapseModifiable
                    promises={userShownCreatedPromises}
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
                  You haven't created any promises yet.
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
            {loading ? (
              <PromisesCollapseSkeleton arraySize={3} />
            ) : !!data ? (
              userInvolvedPromises.length > 0 ? (
                <div className='promises-list-wrapper'>
                  <PromisesCollapseModifiable
                    promises={userShownInvolvedPromises}
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
                  You haven't created any promises yet.
                </div>
              )
            ) : (
              'Seems like there was an error loading this section... Please try refreshing.'
            )}
          </div>
        </div>
        <PromiseDrawer drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
      </section>
    </main>
  );
}
