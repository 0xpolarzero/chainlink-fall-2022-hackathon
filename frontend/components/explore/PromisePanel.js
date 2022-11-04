import PromiseTable from '../PromiseTable';
import IpfsResolver from './IpfsResolver';
import { promiseStatus } from '../../systems/promiseStatus';
import {
  getPartiesApprovedStatus,
  getPartiesTwitterVerifiedStatus,
} from '../../systems/promisePartiesData';
import { getWeb3StorageClient } from '../../systems/getWeb3StorageClient';
import { useProvider, useNetwork } from 'wagmi';
import { useEffect, useState } from 'react';
import { Popover, Skeleton } from 'antd';
import FormattedAddress from '../utils/FormattedAddress';

const web3StorageClient = getWeb3StorageClient();

export default function PromisePanel({ contractAttributes }) {
  const [isPromiseLocked, setIsPromiseLocked] = useState(null);
  const [addressToApprovedStatus, setAddressToApprovedStatus] = useState([]);
  const [addressToTwitterVerifiedStatus, setAddressToTwitterVerifiedStatus] =
    useState([]);
  const [isIpfsLoading, setIsIpfsLoading] = useState(true);
  const [ipfsPeers, setIpfsPeers] = useState([null]);
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

  // Get the pinning status of the IPFS content
  const getIpfsPinningStatus = async () => {
    const info = await web3StorageClient.status(ipfsCid);
    setIpfsPeers(info.pins);
    setIsIpfsLoading(false);
  };

  useEffect(() => {
    gatherPartiesData();
    getIpfsPinningStatus();
  }, []);

  return (
    <div className='promise-card'>
      <div className='security'>
        {isIpfsLoading ? (
          <Skeleton active paragraph={{ rows: 1 }} title={false} />
        ) : (
          <div className='ipfs-pins'>
            Pinned by {ipfsPeers.length} IPFS nodes
            <Popover
              content={ipfsPeers.map((peer) => (
                <p>
                  {
                    <FormattedAddress
                      address={peer.peerId}
                      isShrinked={true}
                      type='ipfs'
                    />
                  }
                </p>
              ))}
            >
              <i className='fas fa-info-circle' />
            </Popover>
          </div>
        )}
      </div>
      <PromiseTable
        contractAttributes={contractAttributes}
        isPromiseLocked={isPromiseLocked}
        addressToApprovedStatus={addressToApprovedStatus}
        addressToTwitterVerifiedStatus={addressToTwitterVerifiedStatus}
      />
      <div key='viewer' className='card-item pdf-viewer'>
        <IpfsResolver uri={ipfsCid} />
      </div>
    </div>
  );
}
