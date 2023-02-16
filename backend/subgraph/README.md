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
    <a href="https://github.com/0xpolarzero/chainlink-fall-2022-hackathon/tree/main/backend/subgraph/issues">Report Bug</a>
    ·
    <a href="https://github.com/0xpolarzero/chainlink-fall-2022-hackathon/tree/main/backend/subgraph/issues">Request Feature</a>
  </p>
</div>

<br />

<!-- ABOUT THE PROJECT -->

# The Graph - subgraph

This folder contains all code related to the subgraph. Namely, it contains the following:

- `schema.graphql` - the GraphQL schema for the subgraph
- `subgraph.yaml` - the subgraph manifest
- `src` - the source code for the subgraph mappings

It takes care of grabbing promises creation and Twitter accounts verification events from the smart contract and storing them in the subgraph. Each time a promise is created, or modified, it updates the `ActivePromise` entity. Each time a Twitter account is verified, it updates the `TwitterVerifiedUser` entity.

<a href="https://docs.usepromise.xyz/"><strong>Explore the documentation »</strong></a>

<br />

## Built with

[![TypeScript]](https://www.typescriptlang.org/)
[![TheGraph]](https://thegraph.com/en/)
[![GraphQL]](https://graphql.org/)
[![Polygon]](https://polygon.technology/)

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
   cd backend/subgraph
   ```
3. Install NPM packages using `yarn` or `npm install`.

## Usage

Generate types:

```sh
graph codegen
```

Build the subgraph:

```sh
graph build
```

Deploy the subgraph:

```sh
graph deploy <your_github_username>/<subgraph_name>
```

You will then need to choose either `hosted-service` or `studio` depending on the chain you want to deploy the subgraph to.

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
[typescript]: https://img.shields.io/badge/TypeScript-007ACC.svg?style=for-the-badge&logo=TypeScript&logoColor=white
[thegraph]: https://custom-icon-badges.demolab.com/badge/TheGraph-0C0A1C?style=for-the-badge&logo=thegraph&logoColor=white
[graphql]: https://img.shields.io/badge/GraphQL-E10098.svg?style=for-the-badge&logo=GraphQL&logoColor=white
[polygon]: https://custom-icon-badges.demolab.com/badge/Polygon-7342DC?style=for-the-badge&logo=polygon&logoColor=white
