import VerifyTwitterInstructions from './VerifyTwitterInstructions';
import { getVerificationDiv } from '../../systems/promisePartiesData';
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
  const [verificationDiv, setVerificationDiv] = useState(null);
  const [isWaitingforVerification, setIsWaitingForVerification] =
    useState(false);
  // const [verifyTwitterContract, setVerifyTwitterContract] = useState(
  //   networkMapping['80001']['VerifyTwitter'][0],
  // );
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

  useEffect(() => {
    setVerificationDiv(
      getVerificationDiv(
        interactingUser.twitterVerifiedStatus,
        'Twitter handle not verified',
      ),
    );
  }, [addressToTwitterVerifiedStatus, userAddress]);

  // useEffect(() => {
  //   if (chain) {
  //     setVerifyTwitterContract(networkMapping[chain.id]['VerifyTwitter'][0]);
  //   }
  // }, [chain]);

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
        <div className='twitter-verify-status'>{verificationDiv}</div>
        <div className='verified'>Twitter verified</div>
      </>
    );
  }

  return (
    <>
      {/* Status */}
      <div className='twitter-verify-status'>{verificationDiv}</div>
      <div></div>
      {/* <Button type='primary' className='no-btn'> */}
      {/* <i className='fas fa-arrow-down'></i> */}
      {/* </Button> */}
      {/* Tweet */}
      <VerifyTwitterInstructions
        userAddress={userAddress}
        requestVerification={requestVerification}
        isWaitingforVerification={isWaitingforVerification}
      />
    </>
  );
}
