import { toast } from 'react-toastify';
import { ethers } from 'ethers';

// Once the request has been sent, wait for the Chainlink Node to fulfill it
const waitForChainlinkFulfillment = async (
  verifyTwitterContract,
  verifyTwitterAbi,
  provider,
  twitterHandle,
  setIsWaitingForVerification,
  refreshData,
) => {
  const contract = new ethers.Contract(
    verifyTwitterContract,
    verifyTwitterAbi,
    provider,
  );
  const promiseWaiting = toast.loading(
    'Waiting for the Chainlink Node to fulfill the request...',
  );

  return await new Promise((resolve) => {
    // Setup a listener for the success event
    contract.on('VerificationSuccessful', async (requestId, result) => {
      if (result.toLowerCase() === twitterHandle.toLowerCase()) {
        setIsWaitingForVerification(false);
        if (refreshData) refreshData();
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
      if (result.toLowerCase() === twitterHandle.toLowerCase()) {
        setIsWaitingForVerification(false);
        if (refreshData) refreshData();
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

export { waitForChainlinkFulfillment };
