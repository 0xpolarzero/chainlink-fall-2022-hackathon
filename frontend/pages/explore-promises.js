import styles from '../styles/Home.module.css';
import ContractCard from '../components/ContractCard';
import { GET_CHILD_CONTRACT_CREATED } from '../constants/subgraphQueries';
import { Collapse, Skeleton } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import { useQuery } from '@apollo/client';
import { useEffect } from 'react';
import FormattedAddress from '../components/FormattedAddress';

export default function explorePromises({ setActivePage }) {
  const { Panel } = Collapse;
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
            <Collapse
              accordion={true}
              bordered={false}
              className='site-collapse-custom-collapse'
            >
              {Array(10)
                .fill(true)
                .map((_, i) => {
                  return (
                    <Panel
                      key={i}
                      header={
                        <Skeleton
                          className='section-explore-skeleton'
                          active
                          paragraph={{ rows: 1 }}
                          title={false}
                        />
                      }
                      className='site-collapse-custom-panel'
                      collapsible='disabled'
                    />
                  );
                })}
            </Collapse>
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
            <Collapse
              accordion={true}
              bordered={false}
              expandIcon={({ isActive }) => (
                <CaretRightOutlined rotate={isActive ? 90 : 0} />
              )}
              className='site-collapse-custom-collapse'
            >
              {data.childContractCreateds.map((childContract) => {
                return (
                  <Panel
                    // header={childContract.agreementName}
                    header={
                      <div className='promise-header'>
                        <div className='promise-header-name'>
                          {childContract.agreementName}
                        </div>
                        <div className='promise-header-address'>
                          Created by{' '}
                          <FormattedAddress
                            address={childContract.owner}
                            isShrinked='responsive'
                          />
                        </div>
                      </div>
                    }
                    key={childContract.id}
                    className='site-collapse-custom-panel'
                  >
                    <ContractCard
                      key={childContract.id}
                      contractAttributes={childContract}
                    />
                  </Panel>
                );
              })}
            </Collapse>
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
