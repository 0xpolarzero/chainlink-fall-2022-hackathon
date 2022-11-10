const CryptoJS = require('crypto-js');
require('dotenv').config();

const KEY = process.env.AES_ENCRYPTION_KEY;
const IV = process.env.AES_ENCRYPTION_IV;

const PROMISE_NAME = 'Test promise';
const PROMISE_ADDRESS = '0x0000000000000000000000000000000000000000';
const USER_ADDRESS = '0x0000000000000000000000000000000000000000';
const IPFS_CID = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';
const ARWEAVE_ID = '1JXtGzqZtJxG0yUvJGmZwWqjLbIuTtqXgKXgjXgqXgq';

const encryptProof = () => {
  const data = PROMISE_NAME + USER_ADDRESS + IPFS_CID + ARWEAVE_ID;

  const encryptedData = CryptoJS.AES.encrypt(data, KEY, {
    iv: IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  const encryptedHex = Buffer.from(encryptedData.toString(), 'base64').toString(
    'hex',
  );

  return encryptedHex;
};

const ENCRYPTED_PROOF = encryptProof();

module.exports = {
  PROMISE_NAME,
  PROMISE_ADDRESS,
  USER_ADDRESS,
  IPFS_CID,
  ARWEAVE_ID,
  ENCRYPTED_PROOF,
};
