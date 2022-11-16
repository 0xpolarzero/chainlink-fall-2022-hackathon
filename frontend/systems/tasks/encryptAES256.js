import CryptoJS from 'crypto-js';

const encryptAES256 = (userAddress, ipfsCid, arweaveId) => {
  const key = process.env.NEXT_PUBLIC_AES_ENCRYPTION_KEY;
  const data = userAddress + ipfsCid + arweaveId;

  // Generate a random iv in hex
  const iv = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);

  // Encrypt
  const encryptedData = CryptoJS.AES.encrypt(data, key, {
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

export { encryptAES256 };
