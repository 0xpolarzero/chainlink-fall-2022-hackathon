<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/polar0/chainlink-fall-2022-hackathon">
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
    <a href="https://github.com/polar0/chainlink-fall-2022-hackathon/tree/main/backend/chainlink-ea-twitter-verification/issues">Report Bug</a>
    ·
    <a href="https://github.com/polar0/chainlink-fall-2022-hackathon/tree/main/backend/chainlink-ea-twitter-verification/issues">Request Feature</a>
  </p>
</div>

<br />

<!-- ABOUT THE PROJECT -->

# External Adapter - Twitter Account Verification

Parts of this document are copied from <a href='https://github.com/thodges-gh/CL-EA-NodeJS-Template'>the Chainlink NodeJS External Adapter Template</a>.

This is a Chainlink External Adapter that verifies a Twitter account by checking if a signature containing the user's Ethereum address is present in their last 10 tweets.

The signature is the following:

- `Verifying my Twitter account for <USER_ADDRESS> with @usePromise!`

While the `username` is passed as a parameter in the request, the `address` is grabbed from the `msg.sender`.

The documentation provides <a href='https://docs.usepromise.xyz/chainlink-external-adapters/twitter-account-verification'>a detailed explanation of the verification process</a>.

<a href="https://docs.usepromise.xyz/"><strong>Explore the documentation »</strong></a>

<br />

## Built with

[![JavaScript]](https://developer.mozilla.org/fr/docs/Web/JavaScript)
[![NodeJS]](https://nodejs.org/en/)
[![Express]](https://expressjs.com/)
[![Mocha]](https://mochajs.org/)
[![Chainlink]](https://chain.link/)
[![AWS]](https://aws.amazon.com/fr/lambda/)

<!-- GETTING STARTED -->

<!----><a id="testing"></a>

#

<p>To get a local copy up and running follow these simple example steps.</p>
<p>You will need to install either <strong>npm</strong> or <strong>yarn</strong> to run the commands, and <strong>git</strong> to clone the repository.</p>

# Installation

1. Clone the repo:
   ```sh
   git clone https://github.com/polar0/chainlink-fall-2022-hackathon
   ```
2. Navigate into this subdirectory:
   ```sh
   cd backend/chainlink-ea-twitter-verification
   ```
3. Install NPM packages using `yarn` or `npm install`.
4. Create a `.env` file at the root of this folder and add the variables listed in the `.env.example` file.

# Usage

### Test

Run the local tests:

```bash
yarn test
```

Natively run the application (defaults to port 8080):

### Run

```bash
yarn start
```

## Call the external adapter/API server

```bash
curl -X POST -H "content-type:application/json" "http://localhost:8080/" --data '{ "id": 0, "data": { "username": "TwitterDev", "address": "0x0000000000000000000000000000000000000000"
} }'
```

## Output

```json
{
  "jobRunID": "b6ddd15e-02e8-4e3c-b884-0f75c7658ba8",
  "data": {
    "result": false,
    "username": "TwitterDev",
    "address": "0x0000000000000000000000000000000000000000",
    "name": "Twitter Dev"
  },
  "statusCode": 200
}
```

## Docker

If you wish to use Docker to run the adapter, you can build the image by running the following command:

```bash
docker build . -t external-adapter
```

Then run it with:

```bash
docker run -p 8080:8080 -it external-adapter:latest
```

## Serverless hosts

After [installing locally](#install-locally):

### Create the zip

```bash
zip -r external-adapter.zip .
```

### Install to AWS Lambda

- In Lambda Functions, create function
- On the Create function page:
  - Give the function a name
  - Use Node.js 12.x for the runtime
  - Choose an existing role or create a new one
  - Click Create Function
- Under Function code, select "Upload a .zip file" from the Code entry type drop-down
- Click Upload and select the `external-adapter.zip` file
- Handler:
  - index.handler for REST API Gateways
  - index.handlerv2 for HTTP API Gateways
- Add the environment variable (repeat for all environment variables):
  - Key: API_KEY
  - Value: Your_API_key
- Save

#### To Set Up an API Gateway (HTTP API)

If using a HTTP API Gateway, Lambda's built-in Test will fail, but you will be able to externally call the function successfully.

- Click Add Trigger
- Select API Gateway in Trigger configuration
- Under API, click Create an API
- Choose HTTP API
- Select the security for the API
- Click Add

#### To Set Up an API Gateway (REST API)

If using a REST API Gateway, you will need to disable the Lambda proxy integration for Lambda-based adapter to function.

- Click Add Trigger
- Select API Gateway in Trigger configuration
- Under API, click Create an API
- Choose REST API
- Select the security for the API
- Click Add
- Click the API Gateway trigger
- Click the name of the trigger (this is a link, a new window opens)
- Click Integration Request
- Uncheck Use Lamba Proxy integration
- Click OK on the two dialogs
- Return to your function
- Remove the API Gateway and Save
- Click Add Trigger and use the same API Gateway
- Select the deployment stage and security
- Click Add

### Install to GCP

- In Functions, create a new function, choose to ZIP upload
- Click Browse and select the `external-adapter.zip` file
- Select a Storage Bucket to keep the zip in
- Function to execute: gcpservice
- Click More, Add variable (repeat for all environment variables)
  - NAME: API_KEY
  - VALUE: Your_API_key

# License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<!----><a id="contact"></a>

# Contact - Social

[![Website][website]](https://polarzero.xyz/)
[![Twitter][twitter]](https://twitter.com/0xpolarzero/)
[![LinkedIn][linkedin]](https://www.linkedin.com/in/antton-lepretre/)
[![0xpolarzero@gmail.com][email]](mailto:0xpolarzero@gmail.com)

Project Link: <strong><a href="https://github.com/polar0/chainlink-fall-2022-hackathon">https://github.com/polar0/chainlink-fall-2022-hackathon</a></strong>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[website]: https://img.shields.io/badge/website-000000?style=for-the-badge&logo=About.me&logoColor=white
[twitter]: https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white
[linkedin]: https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white
[email]: https://img.shields.io/badge/0xpolarzero@gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white
[chainlink]: https://img.shields.io/badge/Chainlink-375BD2.svg?style=for-the-badge&logo=Chainlink&logoColor=white
[javascript]: https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=for-the-badge&logo=JavaScript&logoColor=black
[nodejs]: https://img.shields.io/badge/Node.js-339933.svg?style=for-the-badge&logo=nodedotjs&logoColor=white
[aws]: https://img.shields.io/badge/AWS%20Lambda-FF9900.svg?style=for-the-badge&logo=AWS-Lambda&logoColor=white
[express]: https://img.shields.io/badge/Express-000000.svg?style=for-the-badge&logo=Express&logoColor=white
[mocha]: https://img.shields.io/badge/Mocha-8D6748.svg?style=for-the-badge&logo=Mocha&logoColor=white
