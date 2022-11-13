import CIDTool from 'cid-tool';

const getContentFromCid = async (inputUri) => {
  try {
    const cid = await getCidFromUri(inputUri);
    // List the content of the directory at the provided CID (URI)
    const dir = `https://dweb.link/api/v0/ls?arg=${cid}`;

    const res = await fetch(dir, {
      method: 'POST',
    }).catch((err) => {
      console.log(err);
      return null;
    });
    const data = await res.json();

    // If there is only one file in the directory, and it is a PDF, we can display it
    if (
      data.Objects[0].Links.length === 1 &&
      data.Objects[0].Links[0].Name.endsWith('.pdf')
    ) {
      const pdf = data.Objects[0].Links[0].Hash;
      const pdfUrl = `https://${convertCidToBase32(pdf)}.ipfs.dweb.link/`;
      return {
        link: pdfUrl,
        content: 'pdf',
      };
      // If it contains multiple files, we can just display the directory
    } else {
      let url;
      if (cid.includes('/')) {
        // If it's a directory, split the path at the /
        const split = cid.split('/', 2);
        url = `https://${convertCidToBase32(split[0])}.ipfs.dweb.link/${
          split[1]
        }`;
      } else {
        url = `https://${convertCidToBase32(cid)}.ipfs.dweb.link/`;
      }

      return {
        link: url,
        content: data.Objects[0].Links,
        baseCid: cid,
      };
    }
  } catch (err) {
    console.log(err);
    return null;
  }
};

const getCidFromUri = async (uri) => {
  let cid;
  // Try to extract the cid of the provided uri, if there are any prefix or suffix
  if (uri.includes('ipfs://ipfs/')) {
    cid = uri.split('ipfs://ipfs/')[1];
  } else if (uri.includes('ipfs///')) {
    cid = uri.split('ipfs///')[1];
  } else if (uri.includes('ipfs://')) {
    cid = uri.split('ipfs://')[1];
  } else if (uri.includes('ipfs.io/ipfs/')) {
    cid = uri.split('ipfs.io/ipfs/')[1];
  } else if (uri.includes('ipfs.io/ipns/')) {
    cid = uri.split('ipfs.io/ipns/')[1];
  } else if (uri.includes('https://dweb.link/ipfs/')) {
    cid = uri.split('https://dweb.link/ipfs/')[1];
  } else {
    cid = uri;
  }

  return cid;
};

const convertCidToBase32 = (cid) => {
  const cidBase32 = CIDTool.base32(cid);
  return cidBase32;
};

export { getContentFromCid };
