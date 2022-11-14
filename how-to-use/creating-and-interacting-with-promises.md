---
description: How to create a promise and interact with it?
---

# Creating & interacting with promises

<figure><img src="../.gitbook/assets/image (4).png" alt="Using the menu to navigate to the dashboard"><figcaption><p>Go to the dashboard from the menu.</p></figcaption></figure>

<figure><img src="../.gitbook/assets/image (5).png" alt="Creating a promise using the App"><figcaption><p>Click "New promise" to create a promise.</p></figcaption></figure>

There are two ways of creating a promise:

* using the App
* from the contract

## Create a promise using the App

...

## Creating a promise from the contract

The promise creation window provides a link to create the promise by directly interacting with the contract.

{% hint style="warning" %}
If you create a promise from the contract, without using the App, we won't be able to verify that the files have indeed been uploaded to IPFS & Arweave.

Therefore, the promise will be displayed with the tag ":warning:**Not verified**" on the App UI.
{% endhint %}

<figure><img src="../.gitbook/assets/image (6).png" alt="Navigating to the contract from the App to create a promise"><figcaption><p>Navigating to the contract to create a promise.</p></figcaption></figure>

Once in the `createPromiseContract` function, you will need to provide the following parameters:

| Parameter              | Example input                                               | Info                                                                                                                                                                                                                                                                                                                                         |
| ---------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_promiseName`         | New promise                                                 | <p>Any string.<br>Max length is 70 characters.</p>                                                                                                                                                                                                                                                                                           |
| `_ipfsCid`             | bafybeig62cwoyypdbpvcvkuvpqakvzmezbekolwdbk7ismvcofyjpf35ci | Any IPFS CID.                                                                                                                                                                                                                                                                                                                                |
| `_arweaveId`           | E1XhZ8EYWup3oBK37yXTM9xtONpBZzfgEL0cTx2EWWU                 | Any Arweave ID.                                                                                                                                                                                                                                                                                                                              |
| `_encryptedProof`      | ...                                                         | It doesn't matter here, since it won't be able to get verified. At least one character must be provided.                                                                                                                                                                                                                                     |
| `_partyNames`          | \['Bob']                                                    | <p>An array of strings.</p><p>It needs to be encapsulated in brackets: <code>[...]</code>.</p><p>Each name must be in quotes: <code>'name'</code>. </p><p>Names must be separated by a comma: <code>'name', 'name'</code>. </p>                                                                                                              |
| `_partyTwitterHandles` | \['bobtwitter']                                             | <p>An array of strings.</p><p>It needs to be encapsulated in brackets: <code>[...]</code>.</p><p>Each handle must be in quotes: <code>'handle'</code>. </p><p>Handles must be separated by a comma: <code>'handle', 'handle'</code>.<br>The @ must not be provided.<br>For no handle, an empty string must be supplied: <code>''</code>.</p> |
| `_partyAddresses`      | \[0x000...00]                                               | <p>An array of addresses.</p><p>It needs to be encapsulated in brackets: <code>[...]</code>.</p><p>Addresses must be separated by a comma: <code>'0x000...', '0x000...'</code>.</p>                                                                                                                                                          |

{% hint style="info" %}
All fields need to be filled up in order to submit the transaction.
{% endhint %}

{% hint style="info" %}
The arrays `_partyNames`_,_ `_partyTwitterHandles` __ and __ `_partyAddresses` need to have the same length.
{% endhint %}

