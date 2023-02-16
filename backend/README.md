<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/0xpolarzero/chainlink-fall-2022-hackathon">
    <img src="../resources/asset/logo.svg" alt="Logo" width="80" height="80">
  </a>

<h2 align="center"><b>promise</b> - a blockchain service for founders, creators and regular users.</h3>

  <p align="center">
    Built to help improve trust in our digital relationships and make founders more accountable for their promises.
    <br />
    <a href="https://docs.usepromise.xyz/"><strong>Explore the documentation »</strong></a>
    <br /><br />
    <a href="https://usepromise.xyz/">View Demo</a>
    ·
    <a href="https://github.com/0xpolarzero/chainlink-fall-2022-hackathon/issues">Report Bug</a>
    ·
    <a href="https://github.com/0xpolarzero/chainlink-fall-2022-hackathon/issues">Request Feature</a>
  </p>
</div>

<br />

<!-- ABOUT THE PROJECT -->

#

This folder aggregates the backed - or rather non-frontend - related code. It is a monorepo, meaning that it contains multiple packages.

The main package is the `hardhat` package, which contains the smart contracts and the tests.

The `subgraph` package contains the subgraph used to index the events emitted by the smart contracts.

The `chainlink-ea-storage-verifier` package contains the Chainlink External Adapter used to verify the integrity of file hashes uploaded to IPFS and Arweave.

The `chainlink-ea-twitter-verifier` package contains the Chainlink External Adapter used to verify the Twitter account of a user, specifically by checking their last tweets to find a signature.

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
