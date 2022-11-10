const { Requester, Validator } = require('@chainlink/external-adapter');
const AES = require('crypto-js/aes');
require('dotenv').config();

// Define custom error scenarios for the API.
// Return true for the adapter to retry.
const customError = (data) => {
  if (data.Response === 'Error') return true;
  return false;
};

const customParams = {
  promiseName: true,
  promiseAddress: true,
  userAddress: true,
  ipfsCid: true,
  arweaveId: true,
  encryptedBytes32: true,
};

const createRequest = (input, callback) => {
  const validator = new Validator(callback, input, customParams);
  const jobRunID = validator.validated.id;
  const promiseName = validator.validated.data.promiseName || 'promise';
  const promiseAddress =
    validator.validated.data.promiseAddress ||
    '0x0000000000000000000000000000000000000000';
  const userAddress =
    validator.validated.data.userAddress ||
    '0x0000000000000000000000000000000000000000';
  const ipfsCid =
    validator.validated.data.ipfsCid ||
    'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';
  const arweaveId =
    validator.validated.data.arweaveId ||
    '1JXtGzqZtJxG0yUvJGmZwWqjLbIuTtqXgKXgjXgqXgq';
  const encryptedBytes32 =
    validator.validated.data.encryptedBytes32 ||
    '0x0000000000000000000000000000000000000000000000000000000000000000';

  try {
    const key = process.env.AES_ENCRYPTION_KEY;
    const iv = process.env.AES_ENCRYPTION_IV;
    const data = promiseName + userAddress + ipfsCid + arweaveId;

    const encrypted = AES.encrypt(data, key, {
      iv: iv,
    });
    const encryptedHex = encrypted.ciphertext.toString();
    const encryptedHex32 = '0x' + encryptedHex.slice(0, 64);

    const response = {
      data: {
        result: encryptedBytes32 === encryptedHex32,
        base: encryptedBytes32,
        compare: encryptedHex32,
        data: data,
        promiseAddress: promiseAddress,
      },
      jobRunID,
      status: 200,
    };

    callback(response.status, Requester.success(jobRunID, response));
  } catch (err) {
    console.log(err);
    callback(500, Requester.errored(jobRunID, error));
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
