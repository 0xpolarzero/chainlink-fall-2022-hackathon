import { getVerificationDiv } from '../../systems/promisePartiesData';
import verifyTwitterAbi from '../../constants/VerifyTwitter.json';
import { Button, Popover, Tooltip } from 'antd';
import { toast } from 'react-toastify';
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { useEffect, useState } from 'react';

export default function RowPromiseVerification({
  interactingUser,
  userAddress,
  addressToTwitterVerifiedStatus,
  gatherPartiesData,
}) {
  const [verificationDiv, setVerificationDiv] = useState(null);
  const { config: verifyConfig, error: verifyError } = usePrepareContractWrite({
    //   address: contractAddress,
    abi: verifyTwitterAbi,
    functionName: 'requestVerification',
    args: [],
    enabled:
      !!userAddress &&
      interactingUser.twitterVerifiedStatus !== undefined &&
      !interactingUser.twitterVerifiedStatus,
  });

  const {
    data: verificationData,
    write: verifyTwitter,
    isLoading: isVerifyingTwitter,
  } = useContractWrite({
    ...verifyConfig,
    onSuccess: async (tx) => {
      const txReceipt = await toast.promise(tx.wait(1), {
        pending: 'Requesting verification to the Chainlink Node...',
        success:
          'Request sent! Please wait for the Operator to fulfill the request.',
        error: 'Error sending request',
      });
      gatherPartiesData();
    },
    onError: (err) => {
      toast.error('Error sending request');
      console.log('error sending request', err);
    },
  });

  const { isLoading: isWaitingforVerification } = useWaitForTransaction({
    hash: verificationData?.hash,
    confirmations: 1,
  });

  const copyMessage = (e) => {
    navigator.clipboard.writeText(
      `Verifying my Twitter account for ${userAddress} with @usePromise!`,
    );
    toast.success('Tweet copied to clipboard.');
    e.stopPropagation();
  };

  const openTweet = (e) => {
    window.open(
      `https://twitter.com/intent/tweet?text=Verifying my Twitter account for ${userAddress} with @usePromise!`,
      '_blank',
    );
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

  return (
    <>
      {/* Status */}
      <div className='twitter-verify-status'>{verificationDiv}</div>
      <Button type='primary' className='no-btn'>
        <i className='fas fa-arrow-down'></i>
      </Button>

      {/* Tweet */}
      <div className='twitter-verify-tweet-instructions'>
        1. Tweet the verification message containing your wallet address.
        <Popover
          title='You need to tweet the following:'
          content={
            <div className='popover-address'>
              <div>
                {' '}
                Verifying my Twitter account for {userAddress} with @usePromise!
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
        <div className='instructions'>
          1. Request a verification to the Chainlink Operator
        </div>
        <div className='caption'>It will send a</div>
      </div>
      <Button type='primary'>2. Request verification</Button>
    </>
  );
}
