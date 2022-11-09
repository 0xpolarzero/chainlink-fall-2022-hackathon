const loadIpfs = async () => {
  const { create } = await import('ipfs-core');
  const node = await create();
  return node;
};

const retrieveFromIPFS = async () => {
  const node = await loadIpfs();
  const stream = node.cat(
    'bafybeic5acjtptkbms6uwiuly7njtefx7p2e2vd2kdx6fp6wphvwqsa2ce/getting_started_guide.html',
  );
  const decoder = new TextDecoder();
  let data = '';

  for await (const chunk of stream) {
    // chunks of data are returned as a Uint8Array, convert it back to a string
    data += decoder.decode(chunk, { stream: true });
  }

  console.log(data);
};

retrieveFromIPFS()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
