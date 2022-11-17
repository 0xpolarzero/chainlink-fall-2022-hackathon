const { Requester, Validator } = require('@chainlink/external-adapter');
const CryptoJS = require('crypto-js');
require('dotenv').config();

// Define custom error scenarios for the API.
// Return true for the adapter to retry.
const customError = (data) => {
  if (data.Response === 'Error') return true;
  return false;
};

const customParams = {
  promiseAddress: true,
  userAddress: true,
  ipfsCid: true,
  arweaveId: true,
  encryptedProof: true,
};

const createRequest = (input, callback) => {
  const validator = new Validator(callback, input, customParams);
  const jobRunID = validator.validated.id;
  const promiseAddress =
    validator.validated.data.promiseAddress ||
    '0x0000000000000000000000000000000000000000';
  const userAddress =
    validator.validated.data.userAddress ||
    '0x0000000000000000000000000000000000000000';
  const ipfsCid = validator.validated.data.ipfsCid || '';
  const arweaveId = validator.validated.data.arweaveId || '';
  const encryptedProof = validator.validated.data.encryptedProof || '';

  try {
    const key = process.env.AES_ENCRYPTION_KEY;

    // Grab the iv and encrypted data from the encrypted proof
    const iv = encryptedProof.slice(0, 32);
    const encryptedData = encryptedProof.slice(32);

    // Get back the encrypted hex string in base64
    const encryptedBase64 = Buffer.from(encryptedData, 'hex').toString(
      'base64',
    );

    // We're using a nested try/catch here because otherwise the decrypt function
    // does sometimes throw an error when the key is wrong
    // In this case, we want to return a 200 response with a status of 1
    let decryptedString;
    try {
      // Decrypt it
      const decryptedData = CryptoJS.AES.decrypt(encryptedBase64, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      // We must transform to lowercase because the addresses can mismatch if not
      decryptedString = decryptedData.toString(CryptoJS.enc.Utf8).toLowerCase();
    } catch (err) {
      decryptedString = '';
    }

    const expectedString = (userAddress + ipfsCid + arweaveId).toLowerCase();

    // If the strings don't match, return 1
    // If they do and arweaveId is empty, return 2 (not been uploaded to Arweave)
    // If they do and an arweaveId is provided, return 3
    const storageStatus =
      decryptedString === expectedString ? (arweaveId ? 3 : 2) : 1;

    const response = {
      data: {
        result: storageStatus,
        promiseAddress: promiseAddress,
      },
      jobRunID,
      status: 200,
    };

    callback(response.status, Requester.success(jobRunID, response));
  } catch (err) {
    console.log(err);
    callback(500, Requester.errored(jobRunID, err));
  }
};

// This is a wrapper to allow the function to work with
// GCP Functions
exports.gcpservice = (req, res) => {
  createRequest(req.body, (statusCode, data) => {
    res.status(statusCode).send(data);
  });
};

// This is a wrapper to allow the function to work with
// AWS Lambda
exports.handler = (event, context, callback) => {
  createRequest(event, (statusCode, data) => {
    callback(null, data);
  });
};

// This is a wrapper to allow the function to work with
// newer AWS Lambda implementations
exports.handlerv2 = (event, context, callback) => {
  createRequest(JSON.parse(event.body), (statusCode, data) => {
    callback(null, {
      statusCode: statusCode,
      body: JSON.stringify(data),
      isBase64Encoded: false,
    });
  });
};

// This allows the function to be exported for testing
// or for running in express
module.exports.createRequest = createRequest;
