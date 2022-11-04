import { getWeb3StorageClient } from './getWeb3StorageClient';

const web3StorageClient = getWeb3StorageClient();

const uploadToIPFS = async (files) => {
  // Get originFileObj for each file
  const originFileObjArray = files.map((file) => file.originFileObj);

  // Upload files to IPFS
  const cid = await web3StorageClient.put(originFileObjArray);

  return cid;
};

export { uploadToIPFS };
