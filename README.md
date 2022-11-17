---
description: 'A quick overview: what is promise? Why? How?'
---

# Overview

## What is it? Why?

Promise is a blockchain service for founders, creators and regular users. The end purpose is to **improve trust in our digital relationships** and make founders more accountable for their promises. It is both a way for gathering information about a team and their project, and for them to make a genuine commitment that cannot be altered.

This tool cannot enforce compliance with an objective or a commitment. But, one can imagine that such a process, if it became usual, could provide a much appreciated transparency and permanence in the _Web3_ space, and more extensively in projects that involve significant investments.

By **putting their reputation at stake in a promise**, in a transparent and verifiable process, **it might provide a lucid picture, and an uncensorable record, of the reliability of a person or a group** - or at least, **of their willingness to be held accountable for their actions**.

### For founders

A tool to introduce a team, or just themselves, using their digital identity: Ethereum address, Twitter account. That, associated with a communication of their project: roadmap, letter of intent, diagrams, or just an idea...

They can create a promise, add team members, associate their Twitter account with an Ethereum address, and verify it through a transparent and non-intrusive method. The promise is backed up with any relevant documents, ensuring their permanence and availability. Once the promise has been approved by all involved, it can be locked, thereby freezing it irrevocably on the blockchain.

### For users

We are familiar with the terms of _roadmap_, _utility_, and used to discovering a fine defined schedule when a new project is introduced. While this can be submitted as a blog, website or Twitter thread, _promise_ is a way to know more about this project, **with the assurance that this initiative will not be altered as the project matures and the expectations evolve and expectations might shift**.

It can as well be used as an explorer, to find out which projects a Twitter user, or an Ethereum address, might be involved in. Or just to check if an address is tied with a Twitter account, and the other way around.

## How?

This App makes use of [Chainlink services](https://chain.link/developer-resources) to perform various verifications on the blockchain, which are carried out in an open, transparent and trust-minimized process. The data uploaded during the creation of a promise is sent both to the [IPFS network](https://docs.ipfs.tech/concepts/what-is-ipfs/) & the [Arweave blockchain](https://arwiki.wiki/#/en/main), which guarantees its decentralized distribution through a permanent and inclusive solution. Finally, deploying on [Polygon](https://polygon.technology/solutions/polygon-pos) lets us, among others, achieve quick and cheap transactions, thus ensuring a smooth experience for users. Eventually, each new promise generates a new smart contract that will hold all its data, and allow the participants to interact with it. All events are caught by our subgraph on [The Graph network](https://thegraph.com/), which updates accordingly whenever a promise is created, modified, or a Twitter handle verified.

The following is a summary of how these technologies are leveraged. More extensive explanation can be found in specific sections.

### Chainlink

Among the core features of _promise_ are the two below:

1. securing/attesting the integrity of the content associated with a promise, its availability on the IPFS network and its persistence on the Arweave blockchain ;
2. verifying the Twitter handle of an Ethereum address owner.

But most importantly, such methods are conducted in a fully transparent & trustless environment. Meaning that you don't need to _trust the process_ ; you can actually witness it. These two verification operations are achieved through use of a [Chainlink Node](https://docs.chain.link/chainlink-nodes/), along with [External Adapters](https://docs.chain.link/docs/external-adapters/). The latter allows our contracts to interact with non-blockchain based APIs and packages, while eliminating the risk of dealing with off-chain data and services, usually associated with such operations in centralized opaque environments.

### IPFS & Arweave

There are two ways of creating a promise: from the App, or straight from the contract. Usually, we would suggest the latter, as it removes an unnecessary reliability factor. However, in this case, creating it from the App enables us to assess the links that are provided.

Anyone can create a promise from the contract, and provide - eventually - an IPFS CID and an Arweave ID.  Each one could either be valid or invalid, the IPFS CID could point to some self-hosted content, which, if the user decided to unpin it, could disappear. They could even provide an empty string, which would, of course, be evident on the App.

However, if the promise is generated from the App, a _"proof"_ will be encrypted and included in the contract creation parameters. That proof is the result of the user address, the IPFS CID and, if provided, the Arwead ID, being encrypted in the AES 256 format, using a secret key. Once created, a request will be made to the Chainlink Operator contract, that will ask the External Adapter to verify this proof, provided the same parameters. Since it is supplied with the same secret key, the decryption will produce the same parameters (user address, IPFS CID & Arweave ID), thus ensuring that the contract has indeed been issued from the App. Because we know exactly how these data were dispatched, we can be confident of their persistence:

1. The content addressed to the IPFS network will be grabbed by "our" node. That means, since we are using [web3.storage](https://web3.storage/) as a "provider", we trust that peers will be enticed to pin our content, through the [Filecoin](https://filecoin.io/) network. Additionally, the hash will be displayed on the promise, which inspires users to grab this content and contribute to the network as well.
2. The content addressed to the Arweave blockchain is sent through [Bundlr](https://bundlr.network/), a Layer 2 on Arweave. Among other things, it allows the user to use the same wallet, and the native blockchain token (here MATIC) to pay for the transaction. That content will be processed into a \`.zip\` archive, sent to Arweave, and available for download through a direct link in the promise.
