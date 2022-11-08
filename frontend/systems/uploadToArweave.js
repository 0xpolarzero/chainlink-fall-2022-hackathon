import networkMapping from '../constants/networkMapping';
import { WebBundlr } from '@bundlr-network/client';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

const UPLOAD_SIZE = 10000000;
const SAFE_ADDITIONAL_FUND = '10000000000000000'; // 0.01 MATIC

const uploadToArweave = async (files) => {
  // Initialize Bundlr
  // Get the balance of the instance
  // Get the price for the size of the files
  // If the balance is less than the price, ask the user to fund the instance
};

const initializeBundlr = async (provider, chainId) => {
  const bundlr = new WebBundlr(
    'http://node1.bundlr.network',
    'matic',
    provider,
  );

  await bundlr.ready().catch((err) => {
    console.log(err);
    toast.error('Please connect to the Arweave network to continue');
  });

  let isReady;
  if (bundlr.address === 'Please run `await bundlr.ready()`') {
    isReady = false;
  } else {
    isReady = true;
  }

  return { instance: bundlr, isReady };
};

const fundBundlr = async (provider, chainId) => {
  const rpcUrl =
    chainId === 80001
      ? process.env.NEXT_PUBLIC_MUMBAI_RPC_URL
      : process.env.NEXT_PUBLIC_POLYGON_RPC_URL;

  // Initialize a signer with the private key
  const signer = new ethers.Wallet(
    process.env.NEXT_PUBLIC_PRIVATE_KEY,
    provider,
  );
  const bundlrUrl = networkMapping[chainId].Bundlr[0];
  const bundlr = new WebBundlr(bundlrUrl, 'matic', signer.provider, {
    providerUrl: rpcUrl,
  });
  await bundlr.ready();

  // Get the balance of the instance
  const balance = await bundlr.getLoadedBalance();
  const convertedBalance = bundlr.utils.unitConverter(balance).toString();
  console.log('Current balance: ', convertedBalance);

  // Get the price for x amount of data
  const requiredPrice = await bundlr.getPrice(UPLOAD_SIZE);
  // Add some extra funds to make sure the upload goes through
  const convertedPrice =
    bundlr.utils.unitConverter('matic', requiredPrice).toString() +
    SAFE_ADDITIONAL_FUND;
  console.log('Required price: ', convertedPrice);

  // Fund it with 0.01 MATIC
  await bundlr.fund('100000000000000000');
};

export { uploadToArweave, initializeBundlr, fundBundlr };

// 3.3608
// 1.0455
