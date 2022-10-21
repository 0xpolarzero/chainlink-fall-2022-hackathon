import FormattedAddress from './FormattedAddress';
import { displayPdf } from '../systems/displayPdf.js';
import { Collapse } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';

export default function PromisesList({ promises }) {
  const { Panel } = Collapse;
  return (
    <Collapse
      accordion={true}
      bordered={false}
      expandIcon={({ isActive }) => (
        <CaretRightOutlined rotate={isActive ? 90 : 0} />
      )}
      className='site-collapse-custom-collapse'
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
            key={promise.id}
            className='site-collapse-custom-panel'
          >
            <ContractCard key={promise.id} contractAttributes={promise} />
          </Panel>
        );
      })}
    </Collapse>
  );
}

function ContractCard({ contractAttributes }) {
  const {
    agreementName: promiseName,
    owner,
    contractAddress,
    pdfUri,
    partyNames,
    partyTwitterHandles,
    partyAddresses,
  } = contractAttributes;

  return (
    <div className='promise-card'>
      <div key='contract' className='card-item contract-identity'>
        <div className='contract-address'>
          <div className='title'>Contract address </div>
          <FormattedAddress address={contractAddress} isShrinked='responsive' />
        </div>
        <div className='pdf-link'>
          <div className='title'>PDF link</div>
          {pdfUri}
        </div>
      </div>
      <div key='parties' className='card-item parties'>
        <div className='title'>Involved parties</div>
        <div className='parties-list'>
          {partyNames.map((partyName, index) => {
            return (
              <div key={index} className='party'>
                <div className='party-identity'>
                  <div className='party-name-twitter'>
                    <div className='party-name'>{partyName}</div>
                    <div className='party-twitter'>
                      <i className='fa-brands fa-twitter'></i>
                      <a
                        href={`https://twitter.com/${partyTwitterHandles[index]}`}
                        target='_blank'
                      >
                        @{partyTwitterHandles[index]}
                      </a>
                    </div>
                  </div>
                  <div className='party-twitter-verified'>
                    ✅{' '}
                    <a href='link-to-tx-verifications' target='_blank'>
                      Twitter verified
                    </a>
                  </div>
                </div>
                <div className='party-address'>
                  <FormattedAddress
                    address={partyAddresses[index]}
                    isShrinked='responsive'
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div key='viewer' className='card-item pdf-viewer'>
        {/* {displayPdf(pdfUri)} */}
        {displayPdf(
          'https://ipfs.io/ipfs/QmR7GSQM93Cx5eAg6a6yRzNde1FQv7uL6X1o4k7zrJa3LX/ipfs.draft3.pdf',
        )}
      </div>
    </div>
  );
}