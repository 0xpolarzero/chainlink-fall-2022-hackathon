import VerifyTwitterInstructions from './VerifyTwitterInstructions';
import { waitForChainlinkFulfillment } from '../../systems/verifyTwitter';
import verifyTwitterAbi from '../../constants/VerifyTwitter.json';
import networkMapping from '../../constants/networkMapping';
import { Skeleton } from 'antd';
import { toast } from 'react-toastify';
import {
  useNetwork,
  usePrepareContractWrite,
  useContractWrite,
  useProvider,
} from 'wagmi';
import { useEffect, useState } from 'react';

export default function RowPromiseVerification({
  interactingUser,
  userAddress,
  addressToTwitterVerifiedStatus,
  gatherPartiesData,
}) {
  const [isWaitingforVerification, setIsWaitingForVerification] =
    useState(false);
  const verifyTwitterContract =
    networkMapping[(chain && chain.id) || '80001'].VerifyTwitter[0];
  const { chain } = useNetwork();
  const provider = useProvider();

  const { config: verifyConfig } = usePrepareContractWrite({
    address: verifyTwitterContract,
    abi: verifyTwitterAbi,
    functionName: 'requestVerification',
    args: [interactingUser.twitterHandle],
    enabled:
      !!userAddress &&
      interactingUser.twitterVerifiedStatus !== undefined &&
      !interactingUser.twitterVerifiedStatus,
  });

  const { write: verifyTwitter } = useContractWrite({
    ...verifyConfig,
    onSuccess: async (tx) => {
      const txReceipt = await toast.promise(tx.wait(1), {
        pending: 'Requesting verification to the Chainlink Node...',
        success:
          'Request sent! Please wait for the Chainlink Node to fulfill the request.',
        error: 'Error sending request',
      });
      waitForChainlinkFulfillment(
        verifyTwitterContract,
        verifyTwitterAbi,
        provider,
        interactingUser.twitterHandle,
        setIsWaitingForVerification,
        gatherPartiesData,
      );
    },
    onError: (err) => {
      toast.error('Error sending request');
      console.log('error sending request', err);
      setIsWaitingForVerification(false);
    },
  });

  // Request a verification to the Chainlink Node
  const requestVerification = async () => {
    if (verifyTwitter) {
      setIsWaitingForVerification(true);
      verifyTwitter();
    }
  };

  // If it's loading, set a skeleton
  if (interactingUser.twitterVerifiedStatus === undefined) {
    return (
      <Skeleton
        className='span-double'
        active
        paragraph={{ rows: 3 }}
        title={false}
      />
    );
  }

  // If the user is verified, don't show the instructions and buttons
  if (interactingUser.twitterVerifiedStatus === true) {
    return (
      <>
        <div className='verified' style={{ justifySelf: 'left' }}>
          <i className='fas fa-check'></i>
          Twitter handle verified
        </div>
        <div className='verified'></div>
      </>
    );
  }

  return (
    <>
      <div className='not-verified'>
        <i className='fas fa-times'></i>
        <span>Twitter handle not verified</span>
      </div>
      <div></div>

      <VerifyTwitterInstructions
        userAddress={userAddress}
        requestVerification={requestVerification}
        isWaitingforVerification={isWaitingforVerification}
      />
    </>
  );
}
