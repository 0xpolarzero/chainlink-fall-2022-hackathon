const { Requester, Validator } = require('@chainlink/external-adapter');
const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

// Define custom error scenarios for the API.
// Return true for the adapter to retry.
const customError = (data) => {
  if (data.Response === 'Error') return true;
  return false;
};

// Define the client for the API
const client = new TwitterApi(process.env.BEARER_TOKEN);
const roClient = client.readOnly;

// Define custom parameters to be used by the adapter.
// Extra parameters can be stated in the extra object,
// with a Boolean value indicating whether or not they
// should be required.
const customParams = {
  username: false,
  endpoint: false,
};

const createRequest = (input, callback) => {
  // The Validator helps you validate the Chainlink request data
  const validator = new Validator(callback, input, customParams);
  const jobRunID = validator.validated.id;
  const username = validator.validated.data.username || 'TwitterDev';

  // Get the user's ID from their username
  roClient.v2
    .userByUsername(username)
    .then((preRes) => {
      // ----------------- //
      // Then get their 10 latest tweet
      roClient.v2
        .userTimeline(preRes.data.id, {
          max_results: 10,
          exclude: ['retweets', 'replies'],
        })
        // ----------------- //
        // Then return the response data to the Chainlink node
        .then((res) => {
          const response = {
            data: {
              result: res.data.data.map((tweet) => {
                return tweet.text;
              }),
              username: preRes.data.username,
              userId: preRes.data.id,
              name: preRes.data.name,
            },
            jobRunID,
            status: 200,
          };

          callback(response.status, Requester.success(jobRunID, response));
        })
        .catch((error) => {
          console.log(error);
          callback(500, Requester.errored(jobRunID, error));
        });
    })
    .catch((err) => {
      console.log(err);
      callback(500, Requester.errored(jobRunID, err));
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

// curl -X POST -H "content-type:application/json" "http://localhost:8080/" --data '{ "id": 0, "data": {"username":"0xpolarzero" }}'
