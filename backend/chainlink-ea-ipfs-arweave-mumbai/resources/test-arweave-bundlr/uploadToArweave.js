const Bundlr = require('@bundlr-network/client/');
const dotenv = require('dotenv').config();

const bundlr = new Bundlr.default(
  'https://devnet.bundlr.network',
  'matic',
  process.env.PRIVATE_KEY,
);

const uploadToArweave = async () => {
  console.log((await bundlr.getLoadedBalance()).toString());
};

uploadToArweave()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
