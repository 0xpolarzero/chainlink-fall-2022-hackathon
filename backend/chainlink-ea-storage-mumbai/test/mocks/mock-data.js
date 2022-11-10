const AES = require('crypto-js/aes');
require('dotenv').config();

const PROMISE_NAME = 'Test promise';
const PROMISE_ADDRESS = '0x0000000000000000000000000000000000000000';
const USER_ADDRESS = '0x0000000000000000000000000000000000000000';
const IPFS_CID = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';
const ARWEAVE_ID = '1JXtGzqZtJxG0yUvJGmZwWqjLbIuTtqXgKXgjXgqXgq';

const encryptBytes32 = () => {
  const key = process.env.AES_ENCRYPTION_KEY;
  const iv = process.env.AES_ENCRYPTION_IV;
  const data = PROMISE_NAME + USER_ADDRESS + IPFS_CID + ARWEAVE_ID;

  const encrypted = AES.encrypt(data, key, {
    iv: iv,
  });
  const encryptedHex = encrypted.ciphertext.toString();
  const encryptedHex32 = '0x' + encryptedHex.slice(0, 64);
  console.log(encrypted.ciphertext.words);

  return encryptedHex32;
};

const ENCRYPTED_BYTES32 = encryptBytes32();

encryptBytes32();
module.exports = {
  PROMISE_NAME,
  PROMISE_ADDRESS,
  USER_ADDRESS,
  IPFS_CID,
  ARWEAVE_ID,
  ENCRYPTED_BYTES32,
};
