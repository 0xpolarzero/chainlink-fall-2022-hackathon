import { Button, Popover } from 'antd';

export default function VerifyTwitterInstructions({
  userAddress,
  requestVerification,
  isWaitingforVerification,
}) {
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

  return (
    <>
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
