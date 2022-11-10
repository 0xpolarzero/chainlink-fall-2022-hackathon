import AES from 'crypto-js/aes';

const encryptAES256 = (promiseName, address, ipfsCid, arweaveId) => {
  const key = process.env.NEXT_PUBLIC_AES_ENCRYPTION_KEY;
  const iv = process.env.NEXT_PUBLIC_AES_ENCRYPTION_IV;
  const data = promiseName + address + ipfsCid + arweaveId;

  const encrypted = AES.encrypt(data, key, {
    iv: iv,
  });

  return encrypted.toString();
};

export { encryptAES256 };
