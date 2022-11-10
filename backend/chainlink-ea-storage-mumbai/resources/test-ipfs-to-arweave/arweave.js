/**
 * @notice This code comes from https://github.com/cedriking/ipfsarweave
 * The objective is to retrieve a content from a given IPFS hash and store it on Arweave.
 */

const Arweave = require('arweave/node');

const arweave = Arweave.init({
  host: 'arweave.net',
  protocol: 'https',
  timeout: 20000,
  port: 443,
});

const search = async (key, value) => {
  return await arweave.transactions.search(key, value);
};

const transaction = async (data, tags) => {
  // Need to exploit Bundlr to use MATIC instead of AR
  const wallet = JSON.parse(process.env.ARWEAVE_WALLET);
  const tx = await arweave.createTransaction({ data }, wallet);
};
