---
description: How is the content of a promise sent to Arweave?
---

# Sending to Arweave with Bundlr

If the option is selected, files are zipped and sent to Arweave using Bundlr - which is a PoS network built on top of Arweave. Bundlr nodes _bundle_ multiple transactions, each time for two minutes, and submit them onto Arweave, which makes the process way faster and cheaper, whilst remaining as reliable [(Learn more)](https://docs.bundlr.network/docs/about/introduction).

{% hint style="info" %}
Since the project is deployed on testnets (Polygon Mumbai), the archive is sent to a devnet bundler, which allows the user to pay with testnet currencies.

The only difference with mainnet is that the files are not actually moved to Arweave, but instead deleted after a week.
{% endhint %}

## How are the files sent with Bundlr?

The process is different from the one used to send files to IPFS, and requires more input from the user. It can be condensed into the following steps:

1. Connect the user wallet to the Bundlr node.
2. Prepare the upload
   1. Create the zip archive
   2. Find the price in MATIC for `n` amount of data.
   3. Fund the Bundlr "wallet" - the address associated to the user's private key
3. Create the transaction and upload the data.

Each stage is outlined below, with details in the relevant code.

### Connecting to Bundlr

<pre class="language-javascript" data-title="uploadToArweave.js"><code class="lang-javascript">const initializeBundlr = async (provider, chainId) => {
<strong>  // Find the RPC url based on the chain (mainnet or testnet)
</strong>  const rpcUrl =
    chainId === 80001
      ? process.env.NEXT_PUBLIC_MUMBAI_RPC_URL
      : process.env.NEXT_PUBLIC_POLYGON_RPC_URL;
  // Get the appropriate bundler url (mainnet or devnet)
  const bundlrUrl = networkMapping[chainId].Bundlr[0];
  // Connect with MATIC as a currency to the appropriate node
  const bundlr = new WebBundlr(bundlrUrl, 'matic', provider, {
    providerUrl: rpcUrl,
  });

  await bundlr.ready().catch((err) => {
    console.log(err);
    toast.error('Please connect to the Arweave network to continue');
  });

  let isReady;
  if (bundlr.address === 'Please run `await bundlr.ready()`') {
    isReady = false;
  } else {
    isReady = true;
  }

  return { instance: bundlr, isReady };
};</code></pre>

After the user is connected, they can start interacting with the network.

### Preparing the transaction

{% code title="uploadToArweave.js" %}
```javascript
const uploadToArweave = async javasconst uploadToArweave = async (
  bundlr,
  userBalance,
  files,
  // ...
) => {
  try {
  // Get the instance created during 'initializeBundlr'
    const bundlrInstance = bundlr.instance;

    // Get each file data
    const filesObj = files.map((file) => file.originFileObj);
    // Prepare a read stream
    const preparedFiles = await prepareReadStream(filesObj);
    // Create the zip archive
    const zipFile = await createZip(preparedFiles, formattedPromiseName);
    // Prepare a read stream for the zip archive
    const preparedZip = await prepareReadStream(
      [zipFile],
      formattedPromiseName,
    );

    // Get the price for the upload based on the size of the archive
    const requiredPrice = await bundlrInstance.getPrice(zipFile.size);
    // Find the balance of the user on Bundlr
    const bundlrStartingBalance = await bundlrInstance.getLoadedBalance();
    // Find the needed amount for this upload
    const requiredFund = requiredPrice
      .minus(bundlrStartingBalance)
      .multipliedBy(1.1)
      .integerValue();
      
    // Fund the instance if needed
    const fundTx = await fundBundlr(
      bundlrInstance,
      bundlrStartingBalance,
      userBalance,
      requiredPrice,
      requiredFund,
      // ...
    );
      
    ...
    
  }
}
```
{% endcode %}

{% code title="uploadToArweave.js" %}
```javascript
// Funding the user wallet
const fundBundlr = async (
  bundlrInstance,
  bundlrStartingBalance,
  userBalance,
  requiredPrice,
  requiredFund,
  // ...
) => {
  // Get the balance of the instance and the user
  const formattedRequiredPrice = bundlrInstance.utils
    .unitConverter(requiredPrice)
    .toString();

  // If the balance is not enough for the file(s)
  if (bundlrStartingBalance.isLessThan(requiredPrice)) {
    
    // Format the price
    // 'formattedRequiredFund' is actually 1.1x the required price,
    // just to be sure it will be enough
    // The remaining will still be available on the user wallet
    const formattedRequiredFund = bundlrInstance.utils
      .unitConverter(requiredFund)
      .toFixed(4)
      .toString();

    // Fund the instance
    const fundTx = await toast
      .promise(bundlrInstance.fund(requiredFund), {
        pending: `Funding your Bundlr wallet with ${formattedRequiredFund} MATIC...`,
        success: 'Funded Bundlr successfully!',
        error: 'Failed to fund Bundlr',
      })
      .catch((err) => {
        console.log(err);
        return false;
      });

    return fundTx;
  }

  return true;
};
```
{% endcode %}

### Sending the transaction

{% code title="uploadToArweave.js" %}
```javascript
const uploadToArweave = async javasconst uploadToArweave = async (
  bundlr,
  userBalance,
  files,
  // ...
) => {
  try {
    ...
    
    // Upload the zip to Bundlr
    const uploadedFiles = await uploadFilesToBundlr(
      bundlrInstance,
      preparedZip,
      setStatusMessage,
    );
    
    return uploadedFiles[0];
  } ...
}
```
{% endcode %}

{% code title="uploadToArweave.js" %}
```javascript
const uploadFilesToBundlr = async (
  bundlrInstance,
  preparedFiles,
) => {
  // Upload each file and get the url
  // Here we only have a zip archive, but having it like this can be
  // equally adequate for both cases
  let uploadedFiles = [];
  for (const file of preparedFiles) {
    let uploadProgress = 0;
    // Prepare the uploader
    // Get a chunked uploader
    const uploader = bundlrInstance.uploader.chunkedUploader;
    uploader.setBatchSize(1);
    const uploadOptions = {
      // Grab the file type we attached to its object
      tags: [{ name: 'Content-Type', value: file.type }],
    };

    // Listen for the upload progress
    uploader.on('chunkUpload', (chunk) => {
      // Get it into a percentage
      uploadProgress = ((chunk.totalUploaded / file.size) * 100).toFixed();
    });

    // Upload the file
    const uploadTx = await toast
      .promise(uploader.uploadData(file.stream, uploadOptions), {
        pending: `Bundlr: uploading ${file.name}... (${uploadProgress}%)`,
        success: `${file.name} uploaded successfully!`,
        error: `Failed to upload ${file.name}`,
      })
      .catch((err) => {
        console.log(err);
        return false;
      });

    // Get the url
    const fileId = uploadTx.data.id;
    uploadedFiles.push(fileId);
  }

  // Return all the links
  return uploadedFiles;
};
```
{% endcode %}

## Resources

| Repository                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------- |
| [uploadToArweave.js](https://github.com/polar0/chainlink-fall-2022-hackathon/blob/main/frontend/systems/tasks/uploadToArweave.js) |

| External                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------- |
| [Bundlr Network 101: How does Bundlr work](https://medium.com/bundlr-network/bundlr-network-101-how-does-bundlr-work-a8759d7e338e) |
| [Bundlr docs - Introduction](https://docs.bundlr.network/docs/about/introduction)                                                  |
| [Bundlr docs - Javascript client](https://docs.bundlr.network/docs/client/js)                                                      |
| [What is Arweave? Explain Like I’m Five](https://arweave.medium.com/what-is-arweave-explain-like-im-five-425362144eb5)             |
