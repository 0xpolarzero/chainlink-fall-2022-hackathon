---
description: How is the content of a promise sent to IPFS?
---

# Sending to the IPFS network

The process of getting the content of a promise to be indexed on IPFS is made quite elementary by Web3 Storage. But, most importantly, it's made with a much more reliable approach than indexing this content ourselves - especially since it does not prevent us from pinning it afterwards!

## What does Web3 Storage actually do?

It provides a client for **making data available on IPFS and stored on Filecoin**. Actually, this is a fraction of what this infrastructure enables, but it is the most relevant in our case. You may want to read [this blog post](https://blog.web3.storage/posts/say-hello-to-the-data-layer-1-3-intro-to-web3-storage) to learn more about it.

Essentially, it helps this application interact with the _data layer_ - using their own words - which means, among others, anything referenced with an IPFS CID. We're using it to:

* upload files to IPFS ;
* retrieve information about these files, i.e. the amount of peers pinning a promise content.

\-> getting the amount of peers pinning the content

\-> uploading files&#x20;

Promise created with a IPFS CID in its parameters -> cannot change + IPFS CID refers to an immutable content



{% embed url="https://blog.web3.storage/posts/say-hello-to-the-data-layer-1-3-intro-to-web3-storage" %}
