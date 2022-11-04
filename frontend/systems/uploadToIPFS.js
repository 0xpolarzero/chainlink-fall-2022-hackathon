import { Web3Storage } from 'web3.storage';

const web3StorageClient = new Web3Storage({
  token: process.env.NEXT_PUBLIC_WEB3_STORAGE_API_KEY,
});

const uploadToIPFS = async (files) => {
  // Get originFileObj for each file
  const originFileObjArray = files.map((file) => file.originFileObj);

  // Upload files to IPFS
  const cid = await web3StorageClient.put(originFileObjArray);

  return cid;
};

export { uploadToIPFS };
