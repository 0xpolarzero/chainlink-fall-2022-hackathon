const CryptoJS = require('crypto-js');
require('dotenv').config();

const encryptAES256 = (userAddress, ipfsCid, arweaveId) => {
  const key = process.env.AES_ENCRYPTION_KEY;
  const iv = process.env.AES_ENCRYPTION_IV;
  const data = userAddress + ipfsCid + arweaveId;

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

module.exports = { encryptAES256 };
