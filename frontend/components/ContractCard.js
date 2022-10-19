import ShrinkedAddress from './ShrinkedAddress';

export default function ContractCard({ contractAttributes }) {
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
      <div>
        Contract address <ShrinkedAddress address={contractAddress} />
      </div>
      <div>
        <ShrinkedAddress address={owner} />
      </div>
      <div>{pdfUri}</div>
      <div>
        {partyNames.map((name) => {
          return <div>{name}</div>;
        })}
      </div>
      <div>
        {partyTwitterHandles.map((handle) => {
          return <div>{handle}</div>;
        })}
      </div>
      <div>
        {partyAddresses.map((address) => {
          return <ShrinkedAddress address={address} />;
        })}
      </div>
    </div>
  );
}
