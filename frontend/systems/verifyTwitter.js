import { toast } from 'react-toastify';
import { ethers } from 'ethers';

// Once the request has been sent, wait for the Chainlink Node to fulfill it
const waitForChainlinkFullfillment = async (
  verifyTwitterContract,
  verifyTwitterAbi,
  provider,
  twitterHandle,
  setIsWaitingForVerification,
  gatherPartiesData,
) => {
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
      if (result.toLowerCase() === twitterHandle.toLowerCase()) {
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

export { waitForChainlinkFullfillment };
