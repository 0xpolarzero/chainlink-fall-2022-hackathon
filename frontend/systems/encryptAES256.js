import AES from 'crypto-js/aes';

const encryptAES256 = (promiseName, address, ipfsCid, arweaveId) => {
  const key = process.env.NEXT_PUBLIC_AES_ENCRYPTION_KEY;
  const iv = process.env.NEXT_PUBLIC_AES_ENCRYPTION_IV;
  const data = promiseName + address + ipfsCid + arweaveId;

  const encryptedData = CryptoJS.AES.encrypt(data, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  const encryptedHex = Buffer.from(encryptedData.toString(), 'base64').toString(
    'hex',
  );

  return encryptedHex;
};

export { encryptAES256 };
