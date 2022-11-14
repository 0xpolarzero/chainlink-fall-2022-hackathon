---
description: How to create a promise?
---

# Creating a promise

<figure><img src="../.gitbook/assets/image (10).png" alt="Using the menu to navigate to the dashboard"><figcaption><p>Go to the dashboard from the menu.</p></figcaption></figure>

<figure><img src="../.gitbook/assets/image (2).png" alt="Creating a promise using the App"><figcaption><p>Click "New promise" to create a promise.</p></figcaption></figure>

There are two ways of creating a promise:

* using the App ;
* from the contract.

## Creating a promise using the App

Using the App to create a promise will allow its content to get verified, and spare you the trouble of sending it to IPFS, and eventually to Arweave.&#x20;

<figure><img src="../.gitbook/assets/image (3).png" alt="The window displayed for creating a promise on the App"><figcaption><p>The 'Create promise' drawer on the App.</p></figcaption></figure>

### Filling up the form

The process is rather straightforward:

1. Enter a name for your promise (max 70 characters).
2. Input data for at least one participant:
   * Name (min 2 - max 30 characters) ;
   * Ethereum address (a valid Ethereum address) ;
   * Twitter username (optional ; a valid Twitter handle).
3. Add as many participants as needed.
4. Choose whether you want to send the files to Arweave (if you do so, you will need to sign a message to connect your wallet to the Bundlr network [sending-to-arweave-with-bundlr.md](../ipfs-and-arweave/sending-to-arweave-with-bundlr.md "mention")).
5. Upload as many files as needed (max 10 MB).

{% hint style="warning" %}
You cannot add duplicate Ethereum addresses.
{% endhint %}

{% hint style="warning" %}
You need to upload file by file ; you can't upload a folder directly.
{% endhint %}

{% hint style="info" %}
Files won't be uploaded to IPFS or Arweave until you click the **Create** button.
{% endhint %}

### Approving transactions

Once you click **Create**, the process of "uploading" to IPFS / Arweave and submitting the transaction will start.

If you chose not to send the content to Arweave, you will only need to confirm one transaction, which will create the promise contract holding all its information.

If you chose to send the content to Arweave, there are a few additional steps:

1. **Funding your Bundlr wallet**: you will be prompted to confirm a transaction, that will transfer the required amount in MATIC to your Bundlr wallet ; it will be used for sending the files to the Arweave blockchain.
2. **Authorizing Bundlr**: you will be asked to sign a message to authorize Bundlr to send the files on Arweave.

Once you have completed these steps, the promise will be created, and available both in the **Explore promises** and the **Dashboard** pages.

## Creating a promise from the contract

The promise creation window provides a link to create the promise by directly interacting with the contract.

{% hint style="warning" %}
If you create a promise from the contract, without using the App, we won't be able to verify that the files have indeed been uploaded to IPFS & Arweave.

Therefore, the promise will be displayed with the tag ":warning:**Not verified**" on the App UI.
{% endhint %}

<figure><img src="../.gitbook/assets/image (4).png" alt="Navigating to the contract from the App to create a promise"><figcaption><p>Navigating to the contract to create a promise.</p></figcaption></figure>

Once in the `createPromiseContract` function, you will need to provide the following parameters:

| Parameter              | Example input   | Info                                                                                                                                                                                                                                                                                                                                         |
| ---------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_promiseName`         | New promise     | <p>Any string.<br>Max length is 70 characters.</p>                                                                                                                                                                                                                                                                                           |
| `_ipfsCid`             | bafybe...ci     | Any IPFS CID.                                                                                                                                                                                                                                                                                                                                |
| `_arweaveId`           | E1X...WU        | Any Arweave ID.                                                                                                                                                                                                                                                                                                                              |
| `_encryptedProof`      | ...             | It doesn't matter here, since it won't be able to get verified. At least one character must be provided.                                                                                                                                                                                                                                     |
| `_partyNames`          | \['Bob']        | <p>An array of strings.</p><p>It needs to be encapsulated in brackets: <code>[...]</code>.</p><p>Each name must be in quotes: <code>'name'</code>. </p><p>Names must be separated by a comma: <code>'name', 'name'</code>. </p>                                                                                                              |
| `_partyTwitterHandles` | \['bobtwitter'] | <p>An array of strings.</p><p>It needs to be encapsulated in brackets: <code>[...]</code>.</p><p>Each handle must be in quotes: <code>'handle'</code>. </p><p>Handles must be separated by a comma: <code>'handle', 'handle'</code>.<br>The @ must not be provided.<br>For no handle, an empty string must be supplied: <code>''</code>.</p> |
| `_partyAddresses`      | \[0x000...00]   | <p>An array of addresses.</p><p>It needs to be encapsulated in brackets: <code>[...]</code>.</p><p>Addresses must be separated by a comma: <code>'0x000...', '0x000...'</code>.</p>                                                                                                                                                          |

{% hint style="info" %}
All fields need to be filled up in order to submit the transaction.
{% endhint %}

{% hint style="info" %}
The arrays `_partyNames`_,_ `_partyTwitterHandles` __ and __ `_partyAddresses` need to have the same length.
{% endhint %}

When all the fields have been filled correctly, you can submit the transaction, and refresh the App to see your promise displayed.
