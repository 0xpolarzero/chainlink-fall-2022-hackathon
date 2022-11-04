const { Requester, Validator } = require('@chainlink/external-adapter');
require('dotenv').config();

// Define custom error scenarios for the API.
// Return true for the adapter to retry.
const customError = (data) => {
  if (data.Response === 'Error') return true;
  return false;
};

// Define custom parameters to be used by the adapter.
// Extra parameters can be stated in the extra object,
// with a Boolean value indicating whether or not they
// should be required.
const customParams = {
  endpoint: false,
};

const createRequest = (input, callback) => {
  // The Validator helps you validate the Chainlink request data
  const validator = new Validator(callback, input, customParams);
  const jobRunID = validator.validated.id;
  // const username = validator.validated.data.username || 'TwitterDev';

  // Make the request
  request
    .then((res) => {
      // ...
      const response = {
        data: {
          result: result,
          // username: res.data.username,
        },
        jobRunID,
        status: 200,
      };

      // Then return the response data to the Chainlink node
      callback(response.status, Requester.success(jobRunID, response));
    })
    .catch((error) => {
      console.log(error);
      callback(500, Requester.errored(jobRunID, error));
    });
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

// curl -X POST -H "content-type:application/json" "http://localhost:8080/" --data '{ "id": 0, "data": {"username":"TwitterDev", "signature":"0x1234"} }'
