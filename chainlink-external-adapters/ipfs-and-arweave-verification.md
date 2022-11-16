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

