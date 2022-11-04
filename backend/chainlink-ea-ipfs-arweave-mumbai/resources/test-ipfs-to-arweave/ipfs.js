// This code comes from:
// https://github.com/likecoin/arweave-uploader/

const IPFS = require('ipfs-core');
const { create } = require('ipfs-http-client');
const { extract } = require('it-tar');
const { pipe } = require('it-pipe');
const toBuffer = require('it-to-buffer');
const axios = require('axios');
const map = require('it-map');
const all = require('it-all');
const IPFSOnlyHash = require('ipfs-only-hash');
const { HttpsAgent } = require('agentkeepalive');

const IPFS_GATEWAY_LIST = [
  'https://ipfs.io/ipfs/',
  //   'https://dweb.link/ipfs/',
  //   'https://cloudflare-ipfs.com/ipfs/',
];

const IPFS_TIMEOUT = 300000; // 5min

let ipfsQueryClient;

const ipfsAddClient = create({
  url: 'https://ipfs.infura.io:5001/api/v0',
  timeout: IPFS_TIMEOUT,
  agent: new HttpsAgent({
    timeout: IPFS_TIMEOUT,
  }),
});

async function createIPFSClient() {
  // initing local IPFS node..
  const client = await IPFS.create();
  await client.swarm
    .connect(
      '/ip4/172.65.0.13/tcp/4009/p2p/QmcfgsJsMtx6qJb74akCw1M24X1zFwgGo11h1cuhwQjtJP',
    )
    .catch(() => console.error('Cannot connect to cf ipv4'));
  await client.swarm
    .connect(
      '/ip6/2606:4700:60::6/tcp/4009/p2p/QmcfgsJsMtx6qJb74akCw1M24X1zFwgGo11h1cuhwQjtJP',
    )
    .catch(() => console.error('Cannot connect to cf ipv6'));
  ipfsQueryClient = client;
}

async function shutdownIPFSClient() {
  if (ipfsQueryClient) {
    await ipfsQueryClient.stop();
    ipfsQueryClient = null;
  }
}

function triggerIPFSGet(ipfsHash) {
  // hacky function to try to speed up ipfs retrieval
  return IPFS_GATEWAY_LIST.map(async (g) => {
    try {
      await axios.get(`${g}${ipfsHash}`, { timeout: IPFS_TIMEOUT });
    } catch (_) {
      /* no op */
    }
  });
}

async function* tarballed(source) {
  yield* pipe(
    source,
    extract(),
    // eslint-disable-next-line func-names
    async function* (src) {
      // eslint-disable-next-line no-restricted-syntax
      for await (const entry of src) {
        const { name } = entry.header;
        console.log(`IPFS file: ${name} found`);
        yield {
          ...entry,
          name: entry.header.name,
          buffer: await toBuffer(map(entry.body, (buf) => buf.slice())),
        };
      }
    },
  );
}

async function collect(source) {
  return all(source);
}

async function loadFileFromIPFS(ipfsHash) {
  try {
    if (!ipfsQueryClient) await createIPFSClient();
    console.log(`Querying ${ipfsHash} from IPFS node...`);
    const data = await Promise.all(triggerIPFSGet(ipfsHash));
    console.log(`IPFS node response: ${data}`);
    const output = await pipe(
      ipfsQueryClient.get(ipfsHash),
      tarballed,
      collect,
    );
    return output;
  } catch (err) {
    console.error(err);
    throw new Error(`Cannot get file from IPFS: ${ipfsHash}`);
  }
}

async function uploadFilesToIPFS(files, { onlyHash = true } = {}) {
  const directoryName = 'tmp';
  const promises = ipfsAddClient.addAll(
    files.map((f) => ({
      content: f.buffer,
      path: `/${directoryName}/${f.name}`,
    })),
    { onlyHash },
  );
  const results = [];
  // eslint-disable-next-line no-restricted-syntax
  for await (const result of promises) {
    results.push(result);
  }
  let entry = results.find((r) => r.path === directoryName);
  if (!entry) {
    entry = results.find((r) => r.path.endsWith('index.html'));
  }
  if (!entry) return '';
  const contentHash = entry.cid.toString();
  return contentHash;
}

async function getFileIPFSHash(file) {
  const ipfsHash = await IPFSOnlyHash.of(file.buffer);
  return ipfsHash;
}

async function getFolderIPFSHash(files) {
  const dagHash = await uploadFilesToIPFS(files, { onlyHash: true });
  return dagHash;
}

async function getIPFSHash(files) {
  if (files.length > 1) return getFolderIPFSHash(files);
  const [file] = files;
  const ipfsHash = await getFileIPFSHash(file);
  return ipfsHash;
}

module.exports = {
  loadFileFromIPFS,
  getFileIPFSHash,
  getIPFSHash,
  shutdownIPFSClient,
};
