const { mockTweets } = require('./test/mocks/mock-data');
const { Requester, Validator } = require('@chainlink/external-adapter');
const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

// Define custom error scenarios for the API.
// Return true for the adapter to retry.
const customError = (data) => {
  if (data.Response === 'Error') return true;
  return false;
};

// Check if a signature is a valid hex string
const isValidHex = (str) => {
  return /^0x[0-9a-fA-F]+$/.test(str);
};

// Define the client for the API
const client = new TwitterApi(process.env.BEARER_TOKEN);
const roClient = client.readOnly;

// Define custom parameters to be used by the adapter.
// Extra parameters can be stated in the extra object,
// with a Boolean value indicating whether or not they
// should be required.
const customParams = {
  username: true,
  address: true,
  endpoint: false,
};

const createRequest = (input, callback) => {
  // The Validator helps you validate the Chainlink request data
  const validator = new Validator(callback, input, customParams);
  const jobRunID = validator.validated.id;
  const username = validator.validated.data.username || 'TwitterDev';
  // const signature = validator.validated.data.signature || 'false';
  const address = validator.validated.data.address || 'false';

  // Get the signature it should find in the tweet
  const signature = `Verifying my Twitter account for ${address} with @usePromise!`;

  // Get the user's ID from their username
  roClient.v2
    .userByUsername(username)
    .then((preRes) => {
      // If the username doesn't exist, return early
      if (
        (preRes.errors && preRes.errors[0].title.includes('Not Found')) ||
        !preRes.data
      ) {
        const response = {
          data: {
            username: username,
            result: false,
            address,
          },
          jobRunID,
          status: 200,
        };
        callback(response.status, Requester.success(jobRunID, response));
      } else {
        // ----------------- //
        // Then get their 10 latest tweet
        roClient.v2
          .userTimeline(preRes.data.id, {
            max_results: 10,
            exclude: ['retweets', 'replies'],
          })
          // ----------------- //
          // Then check if their 10 laters tweets include the signature
          .then((res) => {
            // Use mocks to get tweets with the signature for testing
            // only in development
            const tweets =
              process.env.DEVELOPMENT === 'true' ? mockTweets : res.data.data;

            // In each one of the tweets, check if the signature is present
            const result =
              // Make sure there is an address
              isValidHex(address) &&
              // Make sure there are tweets
              !!tweets &&
              // If in the array tweets there is a tweet that includes the signature
              tweets.some((tweet) =>
                tweet.text.toLowerCase().includes(signature.toLowerCase()),
              );

            const response = {
              data: {
                result: result,
                username: preRes.data.username,
                address,
                name: preRes.data.name,
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
      }
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

// curl -X POST -H "content-type:application/json" "http://localhost:8080/" --data '{ "id": 0, "data": {"username":"TwitterDev", "signature":"0x1234"} }'
