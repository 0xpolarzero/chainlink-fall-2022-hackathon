import { Web3Storage } from 'web3.storage';

const getWeb3StorageClient = () => {
  const token = process.env.NEXT_PUBLIC_WEB3_STORAGE_API_KEY;
  if (!token) {
    throw new Error('No Web3.Storage token found');
  }
  return new Web3Storage({ token });
};

export { getWeb3StorageClient };
