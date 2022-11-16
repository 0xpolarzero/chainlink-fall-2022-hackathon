---
description: >-
  How does the App make use of Chainlink to interact with off-chain data &
  computation?
---

# Introduction

The use of Chainlink services enables the contracts both to query off-chain data, and to benefit from intensive computing processes that would otherwise not be achievable on the blockchain.

Specifically, it allows us to:

* make requests to the Twitter API, to verify a Twitter account for an Ethereum address ([twitter-handle-verification.md](twitter-handle-verification.md "mention"));
* generate a proof that a promise was created using the App, thus assuring the persistence and immutability of a content sent to IPFS & Arweave ([ipfs-and-arweave-verification.md](ipfs-and-arweave-verification.md "mention")).

Additionaly, the process being channeled through a blockchain, such operations otherwise opaque are completely **transparent and verifiable** by the user. This is actually what makes _promise_ a **trust-minimized application**: you don't need to _trust the process_, you can rather track its execution, and even skip the actual App to interact with the Node yourself.

The only discomfort here is the IPFS & Arweave hashes verification. To get it verified, the user must create the promise through the App ; it is a bit inconvenient given that we want to keep the alternative of a straight interaction with the contract equal. However, the promise can still be created from the contract in the same way, and other users will be able to pin the content on IPFS to make it more secure. We could have followed the path of a subsequent verification, by reading the content of the supplied IPFS CID, and then sending it to Arweave. But this solution is far too expensive __ in computing resources.

## The verification process

The procedure is basically the same for both operations. The main difference is that anyone can make a request to the `VerifyTwitter` contract, whereas only the `PromiseFactory` is allowed to make a request to the `VerifyStorage` contract (which is made when a promise is created).

Although further explanation is available in the following pages, the steps of the process can be roughly outlined as follows:

1. :arrow\_forward: The user (or the `PromiseFactory`) requests a verification to the [`ChainlinkClient`](https://github.com/smartcontractkit/chainlink/blob/develop/contracts/src/v0.8/ChainlinkClient.sol) implementation (`VerifyTwitter` / `VerifyStorage`).
2. :arrow\_forward: The latter builds that request, and transmits it to the [`Operator`](https://github.com/smartcontractkit/chainlink/blob/develop/contracts/src/v0.7/Operator.sol) contract, including a job ID, a request ID and a previously specified amount of LINK.
3. :arrow\_forward: The `Operator` receives the request, emits an event and triggers the Node to pick it up.
4. :arrow\_forward: The Node grabs the request, chooses a job corresponding to the provided ID, and follows its instructions. At some point, it will use a bridge to trigger the External Adapter, while accurately delivering the parameters that have been carried to this point.
5. :arrow\_forward: The External Adapter retrieves the parameters, and performs any operation it's been supplied with - API request, computation, or anything else. After, completing its tasks, it's ready to transmit the result back to the Node.
6. :arrow\_backward: The Node receives the result, and proceeds to fulfilling the request. It calls the `Operator` contract with either `fulfillOracleRequest` or `fulfillOracleRequest2` (see the note below), along the same request ID, which helps to identify it.
7. :arrow\_backward: Once the fulfillment function called, the `Operator` transmits it to our `ChainlinkClient` implementation, using the function selector that it was initially supplied with. It, however, keeps the LINK as payment for its facilitation.
8. :arrow\_backward: The custom fulfillment function is called, in the very same contract that triggered the initial request.

{% hint style="info" %}
The `Operator` can make both oracle and operator requests. The `oracleRequest` allows a single word response, while the `operatorRequest` allows a multi-word response. A request fulfillment will be called with `fulfillOracleRequest` for the first one, or `fulfillOracleRequest2` for the second one.

In this case, both verifications are made through operator requests.
{% endhint %}

## Platforms

While initially hosted on Google cloud Platform, the Chainlink Node is currently hosted on [Chainlink Node as a Service](https://naas.link/), from [LinkPool](https://linkpool.io/).

{% embed url="https://mumbai.polygonscan.com/address/0x8286abD211dcD9F8485FB6279B4a55696E79f0eB" %}
Chainlink Node on Polygonscan
{% endembed %}

The External Adapters are both hosted as serverless computing functions on [AWS Lambda](https://aws.amazon.com/lambda/).

## Resources

| Contracts                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Chainlink Node](https://mumbai.polygonscan.com/address/0x8286abD211dcD9F8485FB6279B4a55696E79f0eB)                                                           |
| [Operator contract](https://mumbai.polygonscan.com/address/0xd4d1fe6ff0a871ccf37bcfbce3135f548e5f05b5)                                                        |
| [External Adapter - Twitter verification](https://github.com/polar0/chainlink-fall-2022-hackathon/tree/main/backend/chainlink-ea-twitter-verification)        |
| [External Adapter - storage verification](https://github.com/polar0/chainlink-fall-2022-hackathon/tree/main/backend/chainlink-ea-storage-verification)        |
| [VerifyTwitter.sol](https://github.com/polar0/chainlink-fall-2022-hackathon/blob/main/backend/hardhat/contracts/VerifyTwitter.sol)                            |
| [VerifyTwitter (unit tests)](https://github.com/polar0/chainlink-fall-2022-hackathon/blob/main/backend/hardhat/test/unit/VerifyTwitterMock.test.js)           |
| [VerifyTwitter (staging tests)](https://github.com/polar0/chainlink-fall-2022-hackathon/blob/main/backend/hardhat/test/staging/VerifyTwitter.staging.test.js) |
| [VerifyStorage.sol](https://github.com/polar0/chainlink-fall-2022-hackathon/blob/main/backend/hardhat/contracts/VerifyStorage.sol)                            |
| [VerifyStorage (unit tests)](https://github.com/polar0/chainlink-fall-2022-hackathon/blob/main/backend/hardhat/test/unit/VerifyStorageMock.test.js)           |
| [VerifyStorage (staging tests)](https://github.com/polar0/chainlink-fall-2022-hackathon/blob/main/backend/hardhat/test/staging/VerifyStorage.staging.test.js) |

| External                                                                                                     |
| ------------------------------------------------------------------------------------------------------------ |
| [Chainlink documentation - Connect to any API](https://docs.chain.link/docs/any-api/introduction/)           |
| [Chainlink documentation - Running a Chainlink Node](https://docs.chain.link/docs/running-a-chainlink-node/) |
| [Chainlink documentation - External Adapters](https://docs.chain.link/docs/external-adapters/)               |
| [LinkPool - Chainlink Node as a Service](https://naas.link/)                                                 |
| [AWS Lambda](https://aws.amazon.com/lambda/)                                                                 |
