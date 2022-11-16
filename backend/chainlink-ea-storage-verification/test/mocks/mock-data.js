const CryptoJS = require('crypto-js');
require('dotenv').config();

const KEY = process.env.AES_ENCRYPTION_KEY;

const PROMISE_ADDRESS = '0x0000000000000000000000000000000000000000';
const USER_ADDRESS = '0x0000000000000000000000000000000000000000';
const IPFS_CID = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';
const ARWEAVE_ID = '1JXtGzqZtJxG0yUvJGmZwWqjLbIuTtqXgKXgjXgqXgq';

const encryptProof = (dataToEncrypt) => {
  // Generate a random iv in hex
  const iv = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);

  // Encrypt
  const encryptedData = CryptoJS.AES.encrypt(dataToEncrypt, KEY, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  // Turn the encrypted data into a hex string
  const encryptedHex = Buffer.from(encryptedData.toString(), 'base64').toString(
    'hex',
  );

  // Prepend iv to hex encrypted for use in decryption
  return iv + encryptedHex;
};

const ENCRYPTED_PROOF_VALID = encryptProof(
  USER_ADDRESS + IPFS_CID + ARWEAVE_ID,
);
const ENCRYPTED_PROOF_VALID_NO_ARWEAVE = encryptProof(
  USER_ADDRESS + IPFS_CID + '',
);
const ENCRYPTED_PROOF_INVALID = encryptProof(
  USER_ADDRESS + 'wrongCid' + 'wrongId',
);

module.exports = {
  PROMISE_ADDRESS,
  USER_ADDRESS,
  IPFS_CID,
  ARWEAVE_ID,
  ENCRYPTED_PROOF_VALID,
  ENCRYPTED_PROOF_VALID_NO_ARWEAVE,
  ENCRYPTED_PROOF_INVALID,
};
