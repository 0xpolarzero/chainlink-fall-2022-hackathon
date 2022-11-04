const { loadFileFromIPFS } = require(`./ipfs`);

async function main() {
  const ipfsHash = `bafybeibkrn6tcmlyjzlznnsj67kmldbazmk2m265qfupbopahn2lkgjgfe`;
  const files = await loadFileFromIPFS(ipfsHash);
  console.log(files);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
