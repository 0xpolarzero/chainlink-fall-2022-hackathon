import PromisePanel from './PromisePanel';
import InteractPromiseDrawer from './InteractPromiseDrawer';
import FormattedAddress from './utils/FormattedAddress';
import { Collapse, Drawer } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

export default function PromisesCollapse({ promises, context }) {
  const { Panel } = Collapse;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPromise, setDrawerPromise] = useState(null);

  const handlePanelClick = (e) => {
    for (const promise of promises) {
      if (
        promise.contractAddress.toLowerCase() ===
        e.target.dataset.value.toLowerCase()
      ) {
        setDrawerPromise(promise);
        setDrawerOpen(true);
      }
    }
  };

  useEffect(() => {
    const panels = document?.querySelectorAll(
      '.section-user .ant-collapse-item',
    );

    if (panels) {
      panels.forEach((panel) => {
        panel.addEventListener('click', handlePanelClick.bind(this));
      });

      return () => {
        panels.forEach((panel) => {
          panel.removeEventListener('click', handlePanelClick.bind(this));
        });
      };
    }
  }, [document.querySelectorAll('.ant-collapse-item')]);

  return (
    <>
      <Collapse
        accordion={true}
        bordered={false}
        collapsible={context === 'modifiable' ? 'disabled' : ''}
        className='site-collapse-custom-collapse'
        expandIcon={({ isActive }) =>
          context === 'modifiable' ? (
            <i
              className='fas fa-ellipsis'
              onClick={(e) => e.stopPropagation()}
            ></i>
          ) : (
            <CaretRightOutlined rotate={isActive ? 90 : 0} />
          )
        }
      >
        {promises.map((promise) => {
          return (
            <Panel
              key={promise.id}
              className='site-collapse-custom-panel'
              header={
                <div className='promise-header'>
                  <div className='promise-header-name'>
                    {promise.promiseName}
                  </div>
                  <div className='promise-header-address'>
                    Created by{' '}
                    <FormattedAddress
                      address={promise.owner}
                      isShrinked='responsive'
                    />
                  </div>
                  <div
                    className='invisible-wrapper'
                    data-value={promise.contractAddress}
                  ></div>
                </div>
              }
            >
              {context === 'modifiable' ? null : (
                <PromisePanel key={promise.id} contractAttributes={promise} />
              )}
            </Panel>
          );
        })}
      </Collapse>
      <Drawer
        title={drawerPromise?.promiseName}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width
      >
        <InteractPromiseDrawer contractAttributes={drawerPromise} />
      </Drawer>
    </>
  );
}
