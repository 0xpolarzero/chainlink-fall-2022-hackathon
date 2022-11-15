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

## What happens when the External Adapter receives the request?

{% code title="index.js" %}
```javascript
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
```
{% endcode %}
