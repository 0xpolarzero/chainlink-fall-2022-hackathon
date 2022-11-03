import PromiseTable from '../PromiseTable';
import IpfsResolver from './IpfsResolver';
import { promiseStatus } from '../../systems/promiseStatus';
import {
  getPartiesApprovedStatus,
  getPartiesTwitterVerifiedStatus,
} from '../../systems/promisePartiesData';
import { useProvider, useNetwork } from 'wagmi';
import { useEffect, useState } from 'react';

export default function PromisePanel({ contractAttributes }) {
  const [isPromiseLocked, setIsPromiseLocked] = useState(null);
  const [addressToApprovedStatus, setAddressToApprovedStatus] = useState([]);
  const [addressToTwitterVerifiedStatus, setAddressToTwitterVerifiedStatus] =
    useState([]);
  const provider = useProvider();
  const { chain } = useNetwork();

  const { contractAddress, partyAddresses, partyTwitterHandles, pdfUri } =
    contractAttributes;

  const getPromiseStatus = async () => {
    const isLocked = await promiseStatus().getIsPromiseLocked(
      contractAddress,
      provider,
    );
    setIsPromiseLocked(isLocked);
  };

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
      <div key='viewer' className='card-item pdf-viewer'>
        {/* <IpfsResolver uri={pdfUri} /> */}
        <IpfsResolver uri={'QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D'} />
      </div>
    </div>
  );
}
