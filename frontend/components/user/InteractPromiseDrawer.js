import {
  getPartiesApprovedStatus,
  getPartiesTwitterVerifiedStatus,
} from '../../systems/promisePartiesData';
import { getVerificationDiv } from '../../systems/promisePartiesData';
import { promiseStatus } from '../../systems/promiseStatus';
import { useAccount, useProvider, useNetwork } from 'wagmi';
import { useEffect, useState } from 'react';
import PromiseTable from '../PromiseTable';
import RowPromiseAddParticipant from './RowPromiseAddParticipant';
import RowPromiseApproval from './RowPromiseApproval';
import RowPromiseVerification from './RowPromiseVerification';
import RowPromiseLock from './RowPromiseLock';

export default function InteractPromiseDrawer({ contractAttributes }) {
  const [isPromiseLocked, setIsPromiseLocked] = useState(null);
  const [addressToApprovedStatus, setAddressToApprovedStatus] = useState([]);
  const [addressToTwitterVerifiedStatus, setAddressToTwitterVerifiedStatus] =
    useState([]);
  const [allPartiesApproved, setAllPartiesApproved] = useState(null);
  const [interactingUser, setInteractingUser] = useState({});
  const provider = useProvider();
  const { chain } = useNetwork();
  const { address: userAddress } = useAccount();

  const { contractAddress, partyAddresses, partyTwitterHandles } =
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

  useEffect(() => {
    // Display data for the interacting user
    // Get the index of this user's address in the partyAddresses array
    const index = partyAddresses
      .map((address) => address.toLowerCase())
      .indexOf(userAddress.toLowerCase());
    const interactingUserTwitterHandle = partyTwitterHandles[index] || '';

    const interactingUser = {
      address: userAddress,
      twitterHandle: interactingUserTwitterHandle,
      promiseApprovedStatus: addressToApprovedStatus[userAddress.toLowerCase()],
      twitterVerifiedStatus:
        addressToTwitterVerifiedStatus[userAddress.toLowerCase()],
      twitterVerifiedDiv: getVerificationDiv(
        addressToTwitterVerifiedStatus[userAddress.toLowerCase()],
        'Your Twitter account is not verified',
      ),
    };
    setInteractingUser(interactingUser);

    // If the array has been set, check if all parties have approved
    if (Object.keys(addressToApprovedStatus).length === partyAddresses.length) {
      // If there are keys in the addressToApprovedStatus object that are undefined or false
      // then set allPartiesApproved to false
      const allApproved = Object.values(addressToApprovedStatus).every(
        (status) => status,
      );

      setAllPartiesApproved(allApproved);
    }

    // Contract data, once fetched, will update the table
  }, [addressToApprovedStatus, addressToTwitterVerifiedStatus]);

  return (
    <div className='promise-drawer'>
      <PromiseTable
        contractAttributes={contractAttributes}
        isPromiseLocked={isPromiseLocked}
        addressToApprovedStatus={addressToApprovedStatus}
        addressToTwitterVerifiedStatus={addressToTwitterVerifiedStatus}
      />

      <div className='drawer-item interaction'>
        <RowPromiseAddParticipant
          contractAttributes={contractAttributes}
          isPromiseLocked={isPromiseLocked}
        />

        <div className='drawer-item-separator'></div>

        <RowPromiseApproval
          key='approval'
          interactingUser={interactingUser}
          contractAddress={contractAddress}
          userAddress={userAddress}
          addressToApprovedStatus={addressToApprovedStatus}
          gatherPartiesData={gatherPartiesData}
        />

        {interactingUser.twitterHandle === '' ? null : (
          <RowPromiseVerification
            key='verification'
            interactingUser={interactingUser}
            userAddress={userAddress}
            addressToTwitterVerifiedStatus={addressToTwitterVerifiedStatus}
            gatherPartiesData={gatherPartiesData}
          />
        )}

        <div className='drawer-item-separator'></div>

        <RowPromiseLock
          key='lock'
          interactingUser={interactingUser}
          contractAddress={contractAddress}
          userAddress={userAddress}
          isPromiseLocked={isPromiseLocked}
          addressToApprovedStatus={addressToApprovedStatus}
          getPromiseStatus={getPromiseStatus}
          allPartiesApproved={allPartiesApproved}
        />
      </div>
    </div>
  );
}
