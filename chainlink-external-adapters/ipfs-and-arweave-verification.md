---
description: How can we guarantee the integrity of the content attached to a promise?
---

# IPFS & Arweave verification

As described previously, there are two ways of creating a promise: from the App, or from the contract. The former enables the App to generate an encrypted proof, containing both the IPFS CID and the Arweave ID, along with the Ethereum address of the user.

This is meaningful considering that, if the promise was issued from the application, **we can vouch for the integrity of the content**, as we are confident it has indeed been:

* _caught by our IPFS node_, meaning its distribution is being covered by Web3 Storage through the Filecoin network ;
* sent properly to the Arweave blockchain.

{% hint style="warning" %}
During the testnet phase, we are using a Bundlr devnet node, rather than the mainnet ones.

This means that files are actually never sent to Arweave, and are instead deleted after a week.
{% endhint %}

Regardless of whether the promise was created from the application or from the contract, **users can still contribute to indexing the IPFS directory of a promise** ([indexing-an-ipfs-directory.md](../how-to-use/indexing-an-ipfs-directory.md "mention")). This way, they can ensure that it will be **permanently available**.

## How is the proof encrypted?

Right after sending files to IPFS, and optionally to Arweave, the application takes the returned hashes, along with the user address, and proceeds to encrypting them.

{% code title="NewPromiseDrawer.js" overflow="wrap" %}
```javascript
const encryptedProof = encryptAES256(userAddress, ipfsCid, arweaveId);
```
{% endcode %}

This `encryptAES256` function is entrusted with carrying out this [AES 256 encryption](https://www.websiterating.com/cloud-storage/what-is-aes-256-encryption/), given a secret key shared with the External Adapter. Consider the following, [available in the context of the application](https://github.com/polar0/chainlink-fall-2022-hackathon/blob/main/frontend/systems/tasks/encryptAES256.js), in the repository.

{% code title="encryptAES256.js" %}
```javascript
const encryptAES256 = (userAddress, ipfsCid, arweaveId) => {
  // Grab the secret key
  const key = process.env.NEXT_PUBLIC_AES_ENCRYPTION_KEY;
  // Join the user address with the hashes
  const data = userAddress + ipfsCid + arweaveId;

  // Generate a random iv in hex format
  const iv = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);

  // Encrypt in AES 256 CBC
  const encryptedData = CryptoJS.AES.encrypt(data, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  // Turn the encrypted data into a hex string
  const encryptedHex = Buffer.from(encryptedData.toString(), 'base64').toString(
    'hex',
  );

  // Prepend it with the random iv for use in decryption
  return iv + encryptedHex;
};
```
{% endcode %}

The returned string is then supplied as a parameter to the `createPromiseContract` function, which makes a request to the external adapter to verify it.

## How does the EA verify the proof?

> The External Adapter is written as a serverless function. Each time it is triggered with a request, the API server grabs the input parameters, performs the custom computation, and sends back its result (or an error, if anything happens in between).

The process following the request is described in [#the-verification-process](introduction.md#the-verification-process "mention").

Consider the following code, from the `createRequest` function in the external adapter ; it is documented so the process is more transparent to follow:

{% code title="index.js" %}
```javascript
// Custom parameters will be used by the External Adapter
// true: the parameter is required, if not provided it will
// throw an error
// false: the parameter is optional
const customParams = {
  promiseAddress: true,
  userAddress: true,
  ipfsCid: true,
  arweaveId: true,
  encryptedProof: true,
};

const createRequest = (input, callback) => {
  // The Chainlink Validator helps validate the request data
  const validator = new Validator(callback, input, customParams);
  const jobRunID = validator.validated.id;
  
  // The contract address of the promise created
  const promiseAddress =
    validator.validated.data.promiseAddress ||
    '0x0000000000000000000000000000000000000000';
  // The address of the creator of the promise
  const userAddress =
    validator.validated.data.userAddress ||
    '0x0000000000000000000000000000000000000000';
  // The IPFS CID
  const ipfsCid = validator.validated.data.ipfsCid || '';
  // The Arweave ID - if not uploaded to Arweave, it was
  // supplied with an empty string
  const arweaveId = validator.validated.data.arweaveId || '';
  // The hex proof
  const encryptedProof = validator.validated.data.encryptedProof || '';

  try {
    // Grab the secret hex key
    const key = process.env.AES_ENCRYPTION_KEY;

    // Grab the iv and encrypted data from the encrypted proof
    // The iv generated was placed as the first 16 bytes
    const iv = encryptedProof.slice(0, 32);
    const encryptedData = encryptedProof.slice(32);

    // Get back the encrypted hex string in base64
    const encryptedBase64 = Buffer.from(encryptedData, 'hex').toString(
      'base64',
    );

    // Decrypt it
    const decryptedData = CryptoJS.AES.decrypt(encryptedBase64, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    // Get it to lowercase because the addresses could mismatch if not
    const decryptedString = decryptedData
      .toString(CryptoJS.enc.Utf8)
      .toLowerCase();
    const expectedString = (userAddress + ipfsCid + arweaveId).toLowerCase();

    // If the strings don't match, return 1
    // If they do and arweaveId is empty, return 2 (not been uploaded to Arweave)
    // If they do and an arweaveId is provided, return 3
    const storageStatus =
      decryptedString === expectedString ? (arweaveId ? 3 : 2) : 1;

    // Prepare the response
    const response = {
      data: {
        // Either 1, 2 or 3
        result: storageStatus,
        // The address of the promise, so when fulfilling
        // the request, the PromiseFactory can call it to
        // change its storage status
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
```
{% endcode %}

Once the result is returned to the `VerifyStorage` contract, it can fulfill the request and call the `PromiseFactory` to update the _storage status_ for this promise.

## Resources

| External Adapter                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Chainlink Node](https://mumbai.polygonscan.com/address/0x8286abD211dcD9F8485FB6279B4a55696E79f0eB)                                                    |
| [Operator contract](https://mumbai.polygonscan.com/address/0xd4d1fe6ff0a871ccf37bcfbce3135f548e5f05b5)                                                 |
| [External Adapter - storage verification](https://github.com/polar0/chainlink-fall-2022-hackathon/tree/main/backend/chainlink-ea-storage-verification) |
| [Chainlink NodeJS External Adapter Template](https://github.com/thodges-gh/CL-EA-NodeJS-Template)                                                      |

| Contracts |
| --------- |
|           |
|           |
|           |
