/**
 * This is the same as the external adater function, but as a mock
 * Most of the functions are the same, except that it uses a mock response
 * from the Twitter API, instead of making a request
 */

const { Requester, Validator } = require('@chainlink/external-adapter');
const { mockResponse, CORRECT_SIGNATURE } = require('./mock-data');

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
  const signature = validator.validated.data.signature || 'false';

  // Get a same-shaped response from the mock data, with a tweet that includes the signature
  mockResponse()
    .then((res) => {
      const tweets = res.data.data.map((tweet) => tweet.text);
      // In each one of the tweets, check if the signature is present
      const result = tweets.some((tweet) => tweet.includes(signature));

      // Gather the response data
      const response = {
        data: {
          result,
          username: res.data.username,
          userId: res.data.id,
          name: res.data.name,
          tweets,
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

module.exports.createMockRequest = createMockRequest;
