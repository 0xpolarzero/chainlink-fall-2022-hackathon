import { getVerificationDiv } from '../../systems/promisePartiesData';
import verifyTwitterAbi from '../../constants/VerifyTwitter.json';
import networkMapping from '../../constants/networkMapping';
import { Button, Popover, Skeleton } from 'antd';
import { toast } from 'react-toastify';
import {
  useNetwork,
  usePrepareContractWrite,
  useContractWrite,
  useProvider,
} from 'wagmi';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

export default function RowPromiseVerification({
  interactingUser,
  userAddress,
  addressToTwitterVerifiedStatus,
  gatherPartiesData,
}) {
  const [verificationDiv, setVerificationDiv] = useState(null);
  const [isWaitingforVerification, setIsWaitingForVerification] =
    useState(false);
  const [verifyTwitterContract, setVerifyTwitterContract] = useState(
    networkMapping['80001']['VerifyTwitter'][0],
  );
  const { chain } = useNetwork();
  const provider = useProvider();

  const { config: verifyConfig, error: verifyError } = usePrepareContractWrite({
    address: verifyTwitterContract,
    abi: verifyTwitterAbi,
    functionName: 'requestVerification',
    args: [interactingUser.twitterHandle],
    enabled:
      !!userAddress &&
      interactingUser.twitterVerifiedStatus !== undefined &&
      !interactingUser.twitterVerifiedStatus,
  });

  const { data: verificationData, write: verifyTwitter } = useContractWrite({
    ...verifyConfig,
    onSuccess: async (tx) => {
      const txReceipt = await toast.promise(tx.wait(1), {
        pending: 'Requesting verification to the Chainlink Node...',
        success:
          'Request sent! Please wait for the Operator to fulfill the request.',
        error: 'Error sending request',
      });
      waitForFullfillment();
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

  // Once the request has been sent, wait for the Chainlink Node to fulfill it
  const waitForFullfillment = async () => {
    const contract = new ethers.Contract(
      verifyTwitterContract,
      verifyTwitterAbi,
      provider,
    );
    const promiseWaiting = toast.loading(
      'Waiting for the Chainlink Node to fulfill the request...',
    );

    new Promise((resolve) => {
      // Setup a listener for the success event
      contract.on('VerificationSuccessful', async (requestId, result) => {
        if (
          result.toLowerCase() === interactingUser.twitterHandle.toLowerCase()
        ) {
          setIsWaitingForVerification(false);
          gatherPartiesData();
          toast.update(promiseWaiting, {
            render: 'Verification successful!',
            type: 'success',
            isLoading: false,
            autoClose: 5000,
          });
          resolve();
        }
      });
      // Or for the failure event
      contract.on('VerificationFailed', async (requestId, result) => {
        if (
          result.toLowerCase() === interactingUser.twitterHandle.toLowerCase()
        ) {
          setIsWaitingForVerification(false);
          gatherPartiesData();
          toast.update(promiseWaiting, {
            render: 'Verification failed!',
            type: 'error',
            isLoading: false,
            autoClose: 5000,
          });
          resolve();
        }
      });
    });
  };

  const openTweet = (e) => {
    window.open(
      `https://twitter.com/intent/tweet?text=Verifying my Twitter account for ${userAddress} with @usePromise!`,
      '_blank',
    );
    e.stopPropagation();
  };

  const copyMessage = (e) => {
    navigator.clipboard.writeText(
      `Verifying my Twitter account for ${userAddress} with @usePromise!`,
    );
    toast.success('Tweet copied to clipboard.');
    e.stopPropagation();
  };

  useEffect(() => {
    setVerificationDiv(
      getVerificationDiv(
        interactingUser.twitterVerifiedStatus,
        'Twitter handle not verified',
      ),
    );
  }, [addressToTwitterVerifiedStatus, userAddress]);

  useEffect(() => {
    if (chain) {
      setVerifyTwitterContract(networkMapping[chain.id]['VerifyTwitter'][0]);
    }
  }, [chain]);

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
      <div className='twitter-verify-tweet-instructions'>
        1. Tweet the verification message with your wallet address.
        <Popover
          title='You need to tweet the following:'
          content={
            <div className='popover-address'>
              <div>
                <p className='add-space'>
                  <em>
                    Verifying my Twitter account for {userAddress} with
                    @usePromise!
                  </em>
                  <i className='fas fa-copy' onClick={copyMessage}></i>
                </p>
                <p>You can delete it after the verification is complete.</p>
              </div>
            </div>
          }
        >
          {' '}
          <i className='fas fa-question-circle'></i>
        </Popover>
      </div>
      <Button type='primary' onClick={openTweet}>
        <i className='fab fa-twitter' /> Send tweet
      </Button>
      {/* Request for verification */}
      <div className='twitter-verify-request'>
        2. Request a verification to the Chainlink Operator.
        <Popover
          title='It will:'
          content={
            <>
              <div>
                <p>
                  1. Trigger the 'requestVerification' in the contract, then to
                  the <b>Chainlink Operator</b> contract.
                </p>
                <p>
                  2. Pass the request with your username to the{' '}
                  <b>Chainlink Node</b>, which uses{' '}
                  <b>an External Adapter with the Twitter API</b> to verify your
                  tweets.
                </p>
                <p>
                  3. The Chainlink Node will return the result to the Chainlink
                  Operator contract, and then to the contract.
                </p>
                <p>
                  4. This will either return a success or a failure. The former
                  will update the Promise Factory contract to add this handle to
                  the verified accounts associated with your address.
                </p>
              </div>
            </>
          }
        >
          {' '}
          <i className='fas fa-question-circle'></i>
        </Popover>
      </div>
      <Button
        type='primary'
        onClick={requestVerification}
        loading={isWaitingforVerification}
      >
        <i className='fas fa-circle-check' /> Request verification
      </Button>
    </>
  );
}
