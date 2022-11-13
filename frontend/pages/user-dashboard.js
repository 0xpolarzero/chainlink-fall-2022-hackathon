import styles from '../styles/modules/Home.module.css';
import NewPromiseDrawer from '../components/user-dashboard/NewPromiseDrawer';
import VerifyTwitterDrawer from '../components/user-dashboard/VerifyTwitterDrawer';
import PromisesCollapse from '../components/PromisesCollapse';
import PromisesCollapseSkeleton from '../components/PromisesCollapseSkeleton';
import PromisesDataContext from '../systems/context/PromisesDataContext';
import promiseFactoryAbi from '../constants/PromiseFactory.json';
import networkMapping from '../constants/networkMapping';
import { Button, Divider, Pagination, Skeleton } from 'antd';
import { ethers } from 'ethers';
import { useAccount, useNetwork, useProvider } from 'wagmi';
import { useContext, useEffect, useState } from 'react';

export default function userPromises({ setActivePage }) {
  const [isDefinitelyConnected, setIsDefinitelyConnected] = useState(false);
  const [newPromiseDrawerOpen, setNewPromiseDrawerOpen] = useState(false);
  const [userCreatedPromises, setUserCreatedPromises] = useState([]);
  const [userShownCreatedPromises, setUserShownCreatedPromises] = useState([]);
  const [userInvolvedPromises, setUserInvolvedPromises] = useState([]);
  const [userShownInvolvedPromises, setUserShownInvolvedPromises] = useState(
    [],
  );
  const [shownCreatedPage, setShownCreatedPage] = useState(1);
  const [shownInvolvedPage, setShownInvolvedPage] = useState(1);
  const [verifiedHandles, setVerifiedHandles] = useState([]);
  const { address: userAddress, isConnected } = useAccount();
  const [twitterHandleDrawerOpen, setTwitterHandleDrawerOpen] = useState(false);
  const { chain } = useNetwork();
  const provider = useProvider();
  const promiseFactoryAddress =
    networkMapping[chain ? chain.id : '80001'].PromiseFactory[0];
  const { fetchPromises, promises, promisesLoading, promisesError } =
    useContext(PromisesDataContext);

  const getVerifiedHandles = async () => {
    const promiseFactoryContract = new ethers.Contract(
      promiseFactoryAddress,
      promiseFactoryAbi,
      provider,
    );

    const handles = await promiseFactoryContract.getTwitterVerifiedHandle(
      userAddress,
    );
    setVerifiedHandles(handles);
  };

  useEffect(() => {
    fetchPromises();
    getVerifiedHandles();
    setActivePage(3);
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
          <Button
            type='primary'
            className='action-btn'
            onClick={() => setNewPromiseDrawerOpen(true)}
          >
            New Promise
          </Button>
        </div>
        <div className='user-dashboard owner'>
          <div className='header'>
            <Divider plain orientation='left'>
              <div className='header-sub'>You created</div>
            </Divider>
          </div>
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

        <div className='user-dashboard involved'>
          <div className='header'>
            <Divider plain orientation='left'>
              <div className='header-sub'>You're involved with</div>
            </Divider>
          </div>
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

        <div className='user-dashboard twitter-verified'>
          <div className='header'>
            <Divider plain orientation='left' style={{ position: 'relative' }}>
              <div className='header-sub'>Your verified Twitter handles</div>
              <Button
                type='primary'
                className='action-btn absolute'
                onClick={() => setTwitterHandleDrawerOpen(true)}
              >
                Verify handle
              </Button>
            </Divider>
          </div>
          <div className='twitter-verified-list'>
            {!verifiedHandles ? (
              <Skeleton active title={false} paragraph={{ rows: 3 }} />
            ) : verifiedHandles.length > 0 ? (
              verifiedHandles.map((handle) => (
                <div className='twitter-verified-item' key={handle}>
                  <a
                    href={`https://twitter.com/${handle}`}
                    target='_blank'
                    rel='noopener noreferer'
                  >
                    @{handle}
                  </a>
                </div>
              ))
            ) : (
              <div className='no-promises'>
                You haven't verified any Twitter handle yet.
              </div>
            )}
          </div>
        </div>

        <NewPromiseDrawer
          drawerOpen={newPromiseDrawerOpen}
          setDrawerOpen={setNewPromiseDrawerOpen}
        />

        <VerifyTwitterDrawer
          isDrawerOpen={twitterHandleDrawerOpen}
          setIsDrawerOpen={setTwitterHandleDrawerOpen}
        />
      </section>
    </main>
  );
}
