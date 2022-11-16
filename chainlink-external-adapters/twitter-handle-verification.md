---
description: How does the External Adapter verify a Twitter account?
---

# Twitter account verification

<figure><img src="../.gitbook/assets/image.png" alt="Verifying a new Twitter account on the App"><figcaption><p>Verify a new Twitter account.</p></figcaption></figure>

<figure><img src="../.gitbook/assets/image (1).png" alt="Accessing the VerifyTwitter contract on Polygonscan from the App"><figcaption><p>Access the updated VerifyTwitter contract from the Drawer.</p></figcaption></figure>

## How to make a request?

Let's take a look at the verification process. As well as it can be requested from the App, a verification can also be asked directly from the `VerifyTwitter` contract. It will only take a `username` as an input, and grab the Ethereum address from the interacting user.

| Parameter     | Example input | Info                                                                                                         |
| ------------- | ------------- | ------------------------------------------------------------------------------------------------------------ |
| \_username    | bob           | <p>A string representing the Twitter handle.<br>The @ should not be provided.</p>                            |
| \_userAddress | ❌             | The user approving the transaction - the address can't be supplied, as it will grab it from the transaction. |

The process following the request is described in the preceding section ([#the-verification-process](introduction.md#the-verification-process "mention")). We will now further investigate the way in which the External Adapter operates.

## What happens next?

The External Adapter is written as a serverless function. Each time it is triggered with a request, the API server grabs the input parameters, performs the custom computation, and sends back its result (or an error, if anything happens in between). The full code [is available here](https://github.com/polar0/chainlink-fall-2022-hackathon/blob/main/backend/chainlink-ea-twitter-verification/index.js). Let's take a look at what occurs inside the scope of the `createRequest` function ; you will find comments directly in the code, to explain the process.

{% code title="index.js" %}
```javascript
// The Twitter API client is initialized, using a Bearer Token
// It is a read-only key
const client = new TwitterApi(process.env.BEARER_TOKEN);
const roClient = client.readOnly;

// Custom parameters will be used by the External Adapter
// true: the parameter is required, if not provided it will
// throw an error
// false: the parameter is not required
const customParams = {
  username: true,
  address: true,
  endpoint: false,
};

const createRequest = (input, callback) => {
  // The Chainlink Validator helps validate the Chainlink request data
  const validator = new Validator(callback, input, customParams);
  const jobRunID = validator.validated.id;
  
  // Validate input parameters
  // The username specified by the user in the request parameters
  const username = validator.validated.data.username || 'TwitterDev';
  // The Ethereum address of the user, grabbed when they
  // interacted with the contract (msg.sender)
  const address = validator.validated.data.address || 'false';

  // Specify the signature it should find in the tweets
  const signature = `Verifying my Twitter account for ${address} with @usePromise!`;

  // 1st STEP
  // Get the user's ID from their username
  roClient.v2
    .userByUsername(username)
    .then((preRes) => {
      // If the username doesn't exist, return early
      // We don't want to throw an error by trying to read an
      // undefined user tweets ; here, it will just return
      // as if the user could not be verified
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
        // Return that data to the Chainlink Node
        callback(response.status, Requester.success(jobRunID, response));
      } else {
        // 2nd STEP
        // If the user was found, we can proceed
        // Get their 10 latest tweet
        roClient.v2
          .userTimeline(preRes.data.id, {
            max_results: 10,
            exclude: ['retweets', 'replies'],
          })
          // Then check if their 10 latest tweets include the signature
          .then((res) => {
            // If we are in development, use mocks instead of the actual tweets
            // It allows us to test for a successful/failed signature
            const tweets =
              process.env.DEVELOPMENT === 'true' ? mockTweets : res.data.data;

            // In each one of the tweets, check if the signature is present
            const result =
              // Make sure there are tweets
              !!tweets &&
              // Check each one of the tweets, to see if it includes the signature
              // (use lower case to ignore address case irregularities)
              tweets.some((tweet) =>
                tweet.text.toLowerCase().includes(signature.toLowerCase()),
              );

            // Pass the result to the response
            const response = {
              data: {
                // Either true, if the signature was found, otherwise false
                result: result,
                username: preRes.data.username,
                // Return the address to be able to notify the user
                // that the process is complete
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
```
{% endcode %}

## Resources

| External Adapter                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Chainlink Node](https://mumbai.polygonscan.com/address/0x8286abD211dcD9F8485FB6279B4a55696E79f0eB)                                                    |
| [Operator contract](https://mumbai.polygonscan.com/address/0xd4d1fe6ff0a871ccf37bcfbce3135f548e5f05b5)                                                 |
| [External Adapter - Twitter verification](https://github.com/polar0/chainlink-fall-2022-hackathon/tree/main/backend/chainlink-ea-twitter-verification) |
| [External Adapter - storage verification](https://github.com/polar0/chainlink-fall-2022-hackathon/tree/main/backend/chainlink-ea-storage-verification) |
| [Chainlink NodeJS External Adapter Template](https://github.com/thodges-gh/CL-EA-NodeJS-Template)                                                      |

| Contracts                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [VerifyTwitter.sol](https://github.com/polar0/chainlink-fall-2022-hackathon/blob/main/backend/hardhat/contracts/VerifyTwitter.sol)                            |
| [VerifyTwitter (unit tests)](https://github.com/polar0/chainlink-fall-2022-hackathon/blob/main/backend/hardhat/test/unit/VerifyTwitterMock.test.js)           |
| [VerifyTwitter (staging tests)](https://github.com/polar0/chainlink-fall-2022-hackathon/blob/main/backend/hardhat/test/staging/VerifyTwitter.staging.test.js) |
