import AES from 'crypto-js/aes';
import CryptoJS from 'crypto-js';

const encryptAES256 = (promiseName, address, ipfsCid, arweaveId) => {
  const key = process.env.NEXT_PUBLIC_AES_ENCRYPTION_KEY;
  const iv = process.env.NEXT_PUBLIC_AES_ENCRYPTION_IV;
  const data = promiseName + address + ipfsCid + arweaveId;

  const encrypted = AES.encrypt(data, key, {
    iv: iv,
  });

  // We want to be able to store it in a bytes32 variable
  // We only need the first 32 bytes, that will need to match when performing
  // the same process in the External Adapter
  const encryptedHex = encrypted.ciphertext.toString();
  const encryptedHex32 = encryptedHex.slice(0, 64);

  return encryptedHex32;
};

export { encryptAES256 };
