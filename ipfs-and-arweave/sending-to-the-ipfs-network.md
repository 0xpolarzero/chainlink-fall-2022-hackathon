---
description: How is the content of a promise sent to IPFS?
---

# Sending to the IPFS network

The process of getting the content of a promise to be indexed on IPFS is made quite elementary by Web3 Storage. But, most importantly, it's made with a much more reliable approach than indexing this content ourselves - especially since it does not prevent us from pinning it afterwards!

## What does Web3 Storage actually do?

It provides a client for **making data available on IPFS and stored on Filecoin**. Actually, this is a fraction of what this infrastructure enables, but it is the most relevant in our case. You may want to read [this blog post](https://blog.web3.storage/posts/say-hello-to-the-data-layer-1-3-intro-to-web3-storage) to learn more about it.

Essentially, it helps this application interact with the _data layer_ - using their own words - which means, among others, anything referenced with an IPFS CID. We're using it to:

* upload files to IPFS ;
* retrieve information about these files, especially the number of peers pinning a promise content, and the deals it could make with Filecoin miners.

Since the content of the file cannot be changed without altering the CID, which is included in the promise creation arguments, it thus points to a completely immutable material. The only concern is to keep it available on the network, which is precisely what Web3 Storage - and you, if you decide to pin it - takes care of!

## How is it done in the App?

### Sending the files

The transmission of files to IPFS is made rather straightforward with the client. Take a look at the function that handles it:

{% code title="uploadToIPFS.js" lineNumbers="true" %}
```javascript
const uploadToIPFS = async (files, setIpfsUploadProgress) => {
  try {
    // Get the total size of the files
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    let uploadProgress = 0;

    // Update the progress on each chunk
    const onStoredChunk = (size) => {
      uploadProgress += size;
      setIpfsUploadProgress(((uploadProgress / totalSize) * 100).toFixed());
    };

    // Get originFileObj for each file
    const filesArray = files.map((file) => file.originFileObj);

    // Upload files to IPFS
    const cid = await web3StorageClient.put(filesArray, {
      onRootCidReady,
      onStoredChunk,
      maxChunkSize: 1024 * 1024, // 1MiB
    });
    setIpfsUploadProgress(100);

    return cid;
  } catch (err) {
    console.log(err);
    setIpfsUploadProgress('error');
    return false;
  }
};

const onRootCidReady = (cid) => {
  console.log(`Uploading to IPFS: ${cid}`);
};
```
{% endcode %}

See the `line 17`? That is actually the only significant component in the files' submission!

### Retrieving the content

The content of the IPFS directory is first listed using one of the available APIs (here `https://dweb.link/api/`, then fetched, and displayed using a public gateway. We could just have it displayed as a native `ipfs://CID` link, but it would require the user to have an IPFS node setup to resolve it. Which is why we can use public gateways, such as `https://ipfs.dweb.link/ipfs/`. See the following code, used for retrieving the content:

{% code title="getContentFromCid.js" %}
```javascript
const getContentFromCid = async (inputUri) => {
  try {
    // Remove any prefix from the link, in case the user added
    // a link such as 'ipfs://cid', or 'ipfs.io/ipfs/'
    // when creating the promise
    const cid = await getCidFromUri(inputUri);
    // List the content of the directory at the provided CID (URI)
    const dir = `https://dweb.link/api/v0/ls?arg=${cid}`;
    const res = await fetch(dir, {
      method: 'POST',
    }).catch((err) => {
      console.log(err);
      return null;
    });
    const data = await res.json();

    let url;
    if (cid.includes('/')) {
      // If it's a directory, split the path at the /
      const split = cid.split('/', 2);
      // Convert the CID to Base32 in case it is not
      // We want is to be case insensitive, because opening it
      // as a link would turn it into lowercase
      url = `https://${convertCidToBase32(split[0])}.ipfs.dweb.link/${
        split[1]
      }`;
    } else {
      url = `https://${convertCidToBase32(cid)}.ipfs.dweb.link/`;
    }

    // Return the link and its content
    return {
      link: url,
      content: data.Objects[0].Links,
      baseCid: cid,
    };
  } catch (err) {
    console.log(err);
    return null;
  }
};
```
{% endcode %}

The full code, including the other functions, [is available in the Github repository](https://github.com/polar0/chainlink-fall-2022-hackathon/blob/main/frontend/systems/tasks/getContentFromCid.js).

## Resources

| Repository                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [IpfsResolver.js](https://github.com/polar0/chainlink-fall-2022-hackathon/blob/main/frontend/components/explore-promises/IpfsResolver.js)                 |
| [IpfsDisplayDirectory.js](https://github.com/polar0/chainlink-fall-2022-hackathon/blob/main/frontend/components/explore-promises/IpfsDisplayDirectory.js) |
| [uploadToIPFS.js](https://github.com/polar0/chainlink-fall-2022-hackathon/blob/main/frontend/systems/tasks/uploadToIPFS.js)                               |
| [getContentFromCid.js](https://github.com/polar0/chainlink-fall-2022-hackathon/blob/main/frontend/systems/tasks/getContentFromCid.js)                     |

| External                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------- |
| [Web3 Storage - Say hello to the data layer](https://blog.web3.storage/posts/say-hello-to-the-data-layer-1-3-intro-to-web3-storage)             |
| [Filecoin - How storage and retrieval deals work on Filecoin](https://filecoin.io/blog/posts/how-storage-and-retrieval-deals-work-on-filecoin/) |
| [Filecoin - Filecoin's proof system](https://filecoin.io/blog/posts/what-sets-us-apart-filecoin-s-proof-system/)                                |
| [Web3 Storage documentation - JS client library](https://web3.storage/docs/reference/js-client-library/)                                        |
| [IPFS documentation - Immutability](https://docs.ipfs.tech/concepts/immutability/)                                                              |

