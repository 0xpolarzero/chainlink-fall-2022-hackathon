/**
 * This is the same as the external adater function, but as a mock
 * Most of the functions are the same, except that it uses a mock response
 * as the tweets are not fetched from Twitter
 * Everything else is the same
 */

const { mockResponse } = require('./mock-data');
const { Requester, Validator } = require('@chainlink/external-adapter');

// Check if a signature is a valid hex string
const isValidHex = (str) => {
  return /^0x[0-9a-fA-F]+$/.test(str);
};

// Define custom parameters to be used by the adapter.
// Extra parameters can be stated in the extra object,
// with a Boolean value indicating whether or not they
// should be required.
const customParams = {
  username: true,
  signature: true,
  endpoint: false,
};

const createMockRequest = (input, callback) => {
  // The Validator helps you validate the Chainlink request data
  const validator = new Validator(callback, input, customParams);
  const jobRunID = validator.validated.id;
  const username = validator.validated.data.username || 'TwitterDev';
  const signature = validator.validated.data.signature || 'false';

  // Get a same-shaped response from the mock data
  // It will only replace the returned tweets with the mock ones
  mockResponse(username)
    .then((res) => {
      const tweets = res.data.data.map((tweet) => tweet.text);
      // In each one of the tweets, check if the signature is present
      const result =
        isValidHex(signature) &&
        tweets.some((tweet) => tweet.includes(signature));

      // Return an error if it could not verify the signature
      if (!result) {
        callback(
          500,
          Requester.errored(jobRunID, 'Could not verify signature'),
        );
      } else {
        // Gather the response data
        const response = {
          data: {
            result: result,
            username: res.data.username,
            userId: res.data.id,
            name: res.data.name,
            tweets,
            signature,
          },
          jobRunID,
          status: 200,
        };

        // Then return the response data to the Chainlink node
        callback(response.status, Requester.success(jobRunID, response));
      }
    })
    .catch((error) => {
      console.log(error);
      callback(500, Requester.errored(jobRunID, error));
    });
};

module.exports.createMockRequest = createMockRequest;
