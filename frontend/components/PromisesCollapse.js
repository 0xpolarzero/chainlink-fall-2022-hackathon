import PromiseCard from './PromiseCard';
import PromiseModal from './PromiseModal';
import FormattedAddress from './FormattedAddress';
import { Collapse, Table } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';

export default function PromisesCollapse({ promises, context }) {
  const { Panel } = Collapse;

  return (
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
            header={
              <div className='promise-header'>
                <div className='promise-header-name'>
                  {promise.agreementName}
                </div>
                <div className='promise-header-address'>
                  Created by{' '}
                  <FormattedAddress
                    address={promise.owner}
                    isShrinked='responsive'
                  />
                </div>
              </div>
            }
            key={promise.contractAddress}
            className='site-collapse-custom-panel'
          >
            {context === 'modifiable' ? (
              <PromiseModal key={promise.id} contractAttributes={promise} />
            ) : (
              <PromiseCard key={promise.id} contractAttributes={promise} />
            )}
          </Panel>
        );
      })}
    </Collapse>
  );
}
