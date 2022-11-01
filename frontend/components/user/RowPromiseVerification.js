import { getVerificationDiv } from '../../systems/promisePartiesData';
import verifyTwitterAbi from '../../constants/VerifyTwitter.json';
import networkMapping from '../../constants/networkMapping';
import { Button, Popover } from 'antd';
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
  const [requestId, setRequestId] = useState(null);
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

  const waitForFullfillment = async () => {
    gatherPartiesData();
    // Setup a listener for the event
    const contract = new ethers.Contract(
      verifyTwitterContract,
      verifyTwitterAbi,
      provider,
    );

    await toast.promise(
      new Promise((resolve) => {
        console.log('waiting for fulfillment');
        // Setup a listener for the success event
        contract.on('VerificationSuccessful', async (requestId, result) => {
          console.log(result);
          if (requestId === requestId) {
            setIsWaitingForVerification(false);
            gatherPartiesData();
            console.log('fulfilled');
            resolve();
          }
        });
        // Or for the failure event
        contract.on('VerificationFailed', async (requestId, result) => {
          if (requestId === requestId) {
            setIsWaitingForVerification(false);
            gatherPartiesData();
            console.log('fulfilled');
            resolve();
          }
        });
      }),
      {
        pending: 'Waiting for the Chainlink Node to fulfill the request...',
        success: 'Verification successful!',
        error: 'Error verifying Twitter account',
      },
    );
  };

  const requestVerification = async () => {
    if (verifyTwitter) {
      setIsWaitingForVerification(true);
      verifyTwitter();
    }

    // Setup a listener in the VerifyTwitter contract
    // for the VerificationSuccessful or VerificationFailed event
    // await new Promise(async (resolve, reject) => {
    // verifyTwitterContract.once(
    //   'VerificationSuccessful',
    //   (address, twitterHandle, event) => {
    //     // Handle event
    //   },
    // );

    // After the last handleSuccess:
    // setIsWaitingForVerification(false);
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

  return (
    <>
      {/* Status */}
      <div className='twitter-verify-status'>{verificationDiv}</div>
      <Button type='primary' className='no-btn'>
        <i className='fas fa-arrow-down'></i>
      </Button>

      {/* Tweet */}
      <div className='twitter-verify-tweet-instructions'>
        1. Tweet the verification message with your wallet address.
        <Popover
          title='You need to tweet the following:'
          content={
            <div className='popover-address'>
              <div>
                <p>
                  <i>
                    Verifying my Twitter account for {userAddress} with
                    @usePromise!
                  </i>
                </p>
                <p>You can delete it after the verification is complete.</p>
              </div>
              <div>
                <i className='fas fa-copy' onClick={copyMessage}></i>
              </div>
            </div>
          }
        >
          {' '}
          <i className='fas fa-info-circle'></i>
        </Popover>
      </div>

      <Button type='primary' onClick={openTweet}>
        1. Send tweet
      </Button>

      {/* Request for verification */}
      <div className='twitter-verify-request'>
        2. Request a verification to the Chainlink Operator
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
          <i className='fas fa-info-circle'></i>
        </Popover>
      </div>
      <Button
        type='primary'
        onClick={requestVerification}
        loading={isWaitingforVerification}
      >
        2. Request verification
      </Button>
    </>
  );
}
