<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/0xpolarzero/chainlink-fall-2022-hackathon">
    <img src="../../resources/asset/logo.svg" alt="Logo" width="80" height="80">
  </a>

<h2 align="center"><b>promise</b> - a blockchain service for founders, creators and regular users.</h3>

  <p align="center">
    Built to help improve trust in our digital relationships and make founders more accountable for their promises.
    <br />
    <a href="https://docs.usepromise.xyz/"><strong>Explore the documentation »</strong></a>
    <br /><br />
    <a href="https://usepromise.xyz/">View Demo</a>
    ·
    <a href="https://github.com/0xpolarzero/chainlink-fall-2022-hackathon/tree/main/backend/hardhat/issues">Report Bug</a>
    ·
    <a href="https://github.com/0xpolarzero/chainlink-fall-2022-hackathon/tree/main/backend/hardhat/issues">Request Feature</a>
  </p>
</div>

<br />

<!-- ABOUT THE PROJECT -->

# Hardhat - Contracts

This folder contains all the smart contracts and the tests. Namely, it contains the following:

- `PromiseFactory.sol`: the contract that deploys the `PromiseContract` contracts. It also aggregates most of the logic related to interacting with promise (e.g. adding a participant to a promise, adding a verified Twitter account, updating the storage status of a promise, etc.) - it is the main contract.

- `PromiseContract.sol`: the contract that represents a single promise. It contains the logic related to the promise itself (e.g. approving the promise, locking it, actually creating a participant - after being called by the `PromiseFactory` - and similarly for updating the storage status).

- `VerifyStorage`: the contract that verifies the storage status of a promise. It is called by the `PromiseFactory` contract right after a promise is created, and makes a request to the Chainlink node to verify a provided encrypted key containing the IPFS & Arweave hashes <a href='https://docs.usepromise.xyz/chainlink-external-adapters/ipfs-and-arweave-verification'>(see documentation)</a>.

- `VerifyTwitter`: the contract that verifies the Twitter account of a user. It can be called by anyone, and makes a request to the Chainlink node to check that the supplied Twitter handle is indeed linked to the supplied Ethereum address <a href='https://docs.usepromise.xyz/chainlink-external-adapters/twitter-account-verification'>(see documentation)</a>.

Additionally, there are also mocks for the `VerifyStorage` and `VerifyTwitter` contracts, which are used in the unit tests. The same applies for helper contracts in the `contracts/tests` folder.

The `test` folder contains both the unit tests and the staging tests. The staging tests are used to test the integration between the smart contracts and the Chainlink node.

Finally, the deployment phase includes a script that sets allowed verifiers in the `PromiseFactory` contract, and funds both verifiers with LINK tokens.

<a href="https://docs.usepromise.xyz/"><strong>Explore the documentation »</strong></a>

<br />

## Built with

[![Solidity]](https://soliditylang.org/)
[![JavaScript]](https://developer.mozilla.org/fr/docs/Web/JavaScript)
[![Chainlink]](https://chain.link/)
[![EthersJS]](https://docs.ethers.io/v5/)
[![Chai]](https://www.chaijs.com/)
[![Quicknode]](https://www.quicknode.com/)

<!-- GETTING STARTED -->

<!----><a id="testing"></a>

# Trying out / testing

<p>To get a local copy up and running follow these simple example steps.</p>
<p>You will need to install either <strong>npm</strong> or <strong>yarn</strong> to run the commands, and <strong>git</strong> to clone the repository.</p>

## Installation

1. Clone the repo:
   ```sh
   git clone https://github.com/0xpolarzero/chainlink-fall-2022-hackathon
   ```
2. Navigate into this subdirectory:
   ```sh
   cd backend/hardhat
   ```
3. Install NPM packages using `yarn` or `npm install`.
4. Create a `.env` file at the root, and populate it with the same variables as the `.env.example` file.

## Usage

Deploy:

```sh
yarn hardhat deploy
```

You can specify the network to deploy to with the `--network` flag, e.g. `yarn hardhat deploy --network mumbai`. You can use `mumbai`, `hardhat`, `localhost`. The latter will require you to run a local node first with the following command.

Run a local node:

```sh
yarn hardhat node
```

Run tests:

```sh
yarn hardhat test
# you can add the --network flag to run the tests on a specific network
# e.g. yarn hardhat test --network mumbai to run staging tests
```

Report coverage:

```sh
yarn hardhat coverage
# same as above, you can add the --network flag
```

`hh coverage` will report the coverage of the unit tests. The staging tests are not included in the coverage report. This is why it will be critical for `PromiseFactory`, `VerifyStorage` and `VerifyTwitter`, as well as for the Mock versions while running `hh coverage --network mumbai`.

To get the gas usage report included or not, change `enabled` to `true` or `false` in the hardhat.config.js file.

```properties
gasReporter: {
    enabled: true,
}
```

## Recommendations

If you would like to deploy your own version of promise, we recommend that you follow theses steps:

1. Deploy main contracts (`PromiseFactory`, `VerifyStorage`, `VerifyTwitter`).
2. Prepare contracts:

- Deploy with the `--tags prepare` tag, which will run `04-prepare-contracts.js`, and set the allowed verifiers in the `PromiseFactory` contract, along with funding them with LINK tokens.
- OR Set the verifiers manually, and fund them with LINK tokens (by just sending LINK to the verifiers' addresses).

3. Check that `promiseFactoryContract` is set to the correct address in both verifier contracts. If not, set it manually with `setPromiseFactoryContract` in both.

This is assuming you are using our Chainlink Node and External Adapters. If you are using your own, you should first:

1. Deploy the `Operator.sol` contract.
2. Setup a Node and authorize it in your Operator contract.
3. Change the `OPERATOR_MUMBAI` variable in `helper-hardhat-config.js` to your Operator contract address.
4. Setup your jobs and external adapters.
5. Change the `STORAGE_JOB_ID` and `TWITTER_JOB_ID` variables in `helper-hardhat-config.js` to your job IDs.

# License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<!----><a id="contact"></a>

# Contact - Social

[![Website][website]](https://polarzero.xyz/)
[![Twitter][twitter]](https://twitter.com/0xpolarzero/)
[![LinkedIn][linkedin]](https://www.linkedin.com/in/antton-lepretre/)
[![0xpolarzero@gmail.com][email]](mailto:0xpolarzero@gmail.com)

Project Link: <strong><a href="https://github.com/0xpolarzero/chainlink-fall-2022-hackathon">https://github.com/0xpolarzero/chainlink-fall-2022-hackathon</a></strong>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[website]: https://img.shields.io/badge/website-000000?style=for-the-badge&logo=About.me&logoColor=white
[twitter]: https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white
[linkedin]: https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white
[email]: https://img.shields.io/badge/0xpolarzero@gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white
[solidity]: https://custom-icon-badges.demolab.com/badge/Solidity-3C3C3D?style=for-the-badge&logo=solidity&logoColor=white
[chainlink]: https://img.shields.io/badge/Chainlink-375BD2.svg?style=for-the-badge&logo=Chainlink&logoColor=white
[javascript]: https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=for-the-badge&logo=JavaScript&logoColor=black
[ethersjs]: https://custom-icon-badges.demolab.com/badge/Ethers.js-29349A?style=for-the-badge&logo=ethers&logoColor=white
[hardhat]: https://custom-icon-badges.demolab.com/badge/Hardhat-181A1F?style=for-the-badge&logo=hardhat
[chai]: https://img.shields.io/badge/Chai-A30701.svg?style=for-the-badge&logo=Chai&logoColor=white
[quicknode]: https://custom-icon-badges.demolab.com/badge/Quicknode-49A1D1?style=for-the-badge&logo=quicknode-&logoColor=white
