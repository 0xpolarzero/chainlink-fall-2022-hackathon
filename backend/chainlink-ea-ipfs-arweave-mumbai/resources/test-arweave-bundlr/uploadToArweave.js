import Bundlr from '@bundlr-network/client';
import dotenv from 'dotenv';
dotenv.config();

const bundlr = new Bundlr(
  'http://node1.bundlr.network',
  'MATIC',
  process.env.PRIVATE_KEY,
);

async function uploadToArweave() {
  console.log(bundlr.getLoadedBalance());
}

uploadToArweave()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
