import PromiseTable from '../PromiseTable';
import IpfsResolver from './IpfsResolver';
import { promiseStatus } from '../../systems/structure/promiseStatus';
import {
  getPartiesApprovedStatus,
  getPartiesTwitterVerifiedStatus,
} from '../../systems/structure/promisePartiesData';
import { useProvider, useNetwork } from 'wagmi';
import { useEffect, useState } from 'react';

export default function PromisePanel({ contractAttributes }) {
  const [isPromiseLocked, setIsPromiseLocked] = useState(null);
  const [addressToApprovedStatus, setAddressToApprovedStatus] = useState([]);
  const [addressToTwitterVerifiedStatus, setAddressToTwitterVerifiedStatus] =
    useState([]);
  const provider = useProvider();
  const { chain } = useNetwork();

  const { contractAddress, partyAddresses, partyTwitterHandles, ipfsCid } =
    contractAttributes;
  // Status of the promise (locked/unlocked)
  const getPromiseStatus = async () => {
    const isLocked = await promiseStatus().getIsPromiseLocked(
      contractAddress,
      provider,
    );
    setIsPromiseLocked(isLocked);
  };

  // Status of the parties (approved/not approved & twitter verified/not verified)
  const gatherPartiesData = async () => {
    getPromiseStatus();

    const partiesApprovedStatus = await getPartiesApprovedStatus(
      contractAddress,
      partyAddresses,
      provider,
    );
    setAddressToApprovedStatus(partiesApprovedStatus);

    const partiesTwitterVerifiedStatus = await getPartiesTwitterVerifiedStatus(
      partyTwitterHandles,
      partyAddresses,
      provider,
      chain,
    );
    setAddressToTwitterVerifiedStatus(partiesTwitterVerifiedStatus);
  };

  useEffect(() => {
    gatherPartiesData();
  }, []);

  return (
    <div className='promise-card'>
      <PromiseTable
        contractAttributes={contractAttributes}
        isPromiseLocked={isPromiseLocked}
        addressToApprovedStatus={addressToApprovedStatus}
        addressToTwitterVerifiedStatus={addressToTwitterVerifiedStatus}
      />
      <div key='viewer' className='card-item ipfs-viewer'>
        <IpfsResolver ipfsCid={ipfsCid} contractAddress={contractAddress} />
      </div>
    </div>
  );
}
