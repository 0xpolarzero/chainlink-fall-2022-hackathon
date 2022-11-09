import networkMapping from '../constants/networkMapping';
import fileReaderStream from 'filereader-stream';
import JSZip from 'jszip';
import { Modal } from 'antd';
import { WebBundlr } from '@bundlr-network/client';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

const zip = new JSZip();

const uploadToArweave = async (bundlr, userBalance, files, promiseName) => {
  try {
    const bundlrInstance = bundlr.instance;
    const formattedPromiseName = promiseName.toLowerCase().replace(/\s/g, '-');

    // GATHER INFORMATIONS ------------------------------------------------------
    // Get the total size of the files
    let totalSize = 0;
    files.forEach((file) => {
      totalSize += file.size;
    });
    // Find the required price for the upload
    const requiredPrice = await bundlrInstance.getPrice(totalSize);
    const requiredFund = requiredPrice
      .minus(bundlrStartingBalance)
      .multipliedBy(1.1)
      .integerValue();

    // Fund the instance if needed
    const fundTx = await fundBundlr(
      bundlrInstance,
      userBalance,
      requiredPrice,
      requiredFund,
    );

    if (!fundTx) {
      return false;
    }

    // SEND FILES TO BUNDLR ---------------------------------------------------
    const preparedFiles = await prepareReadStream(files);
    const uploadedFiles = await uploadFilesToBundlr(
      bundlrInstance,
      preparedFiles,
    );

    // Check that each file was uploaded successfully (if not it's false)
    if (uploadedFiles.includes(false)) {
      toast.error('Failed to upload one or more files');
      return false;
    }

    await returnBalanceToUser(bundlrInstance);

    console.log(uploadedFiles);
    return uploadedFiles;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const initializeBundlr = async (provider, chainId) => {
  const rpcUrl =
    chainId === 80001
      ? process.env.NEXT_PUBLIC_MUMBAI_RPC_URL
      : process.env.NEXT_PUBLIC_POLYGON_RPC_URL;
  const bundlrUrl = networkMapping[chainId].Bundlr[0];
  const bundlr = new WebBundlr(bundlrUrl, 'matic', provider, {
    providerUrl: rpcUrl,
  });

  await bundlr.ready().catch((err) => {
    console.log(err);
    toast.error('Please connect to the Arweave network to continue');
  });

  let isReady;
  if (bundlr.address === 'Please run `await bundlr.ready()`') {
    isReady = false;
  } else {
    isReady = true;
  }

  return { instance: bundlr, isReady };
};

const fundBundlr = async (
  bundlrInstance,
  userBalance,
  requiredPrice,
  requiredFund,
) => {
  // Get the balance of the instance and the user
  const bundlrStartingBalance = await bundlrInstance.getLoadedBalance();
  console.log(
    'Bundlr balance: ',
    ethers.utils.formatUnits(bundlrStartingBalance.toString(), 'ether'),
  );
  console.log(
    'User balance: ',
    ethers.utils.formatUnits(userBalance.value, 'ether'),
  );

  const formattedRequiredPrice = bundlrInstance.utils
    .unitConverter(requiredPrice)
    .toString();

  // FUND THE INSTANCE --------------------------------------------------------
  if (bundlrStartingBalance.isLessThan(requiredPrice)) {
    if (userBalance.value.formatted < formattedRequiredPrice) {
      toast.error(
        `Insufficient funds to upload to Arweave. You need at least ${formattedRequiredPrice} MATIC to upload.`,
      );
      return false;
    } else {
      // Fund the bundlr instance - add a safe amount to the required price
      const formattedRequiredFund = bundlrInstance.utils
        .unitConverter(requiredFund)
        .toFixed(4)
        .toString();

      const fundTx = await toast
        .promise(bundlrInstance.fund(requiredFund), {
          pending: `Funding your Bundlr wallet with ${formattedRequiredFund} MATIC...`,
          success: 'Funded Bundlr successfully!',
          error: 'Failed to fund Bundlr',
        })
        .catch((err) => {
          console.log(err);
          return false;
        });
    }
  }
};

const prepareReadStream = async (files) => {
  // Prepare a read stream for the files
  let preparedFiles = [];
  for (let i = 0; i < files.length; i++) {
    await new Promise((resolve, reject) => {
      console.log('Preparing file: ', files[i].name);
      const fileStream = fileReaderStream(files[i].originFileObj);
      preparedFiles.push({
        stream: fileStream,
        name: files[i].name,
        type: files[i].type,
        size: files[i].size,
      });
      resolve();
    }).catch((err) => {
      toast.error(
        `Failed to prepare file ${files[i].originFileObj.name} for upload`,
      );
      console.log(err);
      return false;
    });
  }

  return preparedFiles;
};

const uploadFilesToBundlr = async (bundlrInstance, preparedFiles) => {
  // Upload each file and get the url
  let uploadedFiles = [];
  for (const file of preparedFiles) {
    let uploadProgress = 0;
    // Prepare the uploader
    const uploader = bundlrInstance.uploader.chunkedUploader;
    uploader.setBatchSize(1);
    const uploadOptions = {
      tags: [{ name: 'Content-Type', value: file.type }],
    };

    // Listen for the upload progress
    uploader.on('chunkUpload', (chunk) => {
      uploadProgress = ((chunk.totalUploaded / file.size) * 100).toFixed();
    });

    // Upload the file
    const uploadTx = await toast
      .promise(uploader.uploadData(file.stream, uploadOptions), {
        pending: `Bundlr: uploading ${file.name}... (${uploadProgress}%)`,
        success: `${file.name} uploaded successfully!`,
        error: `Failed to upload ${file.name}`,
      })
      .catch((err) => {
        console.log(err);
        return false;
      });
    console.log(uploadTx);

    // Get the url
    const fileUrl = `https://arweave.net/${uploadTx.data.id}`;
    uploadedFiles.push(fileUrl);
  }

  return uploadedFiles;
};

const returnBalanceToUser = async (bundlrInstance) => {
  // Return the remaining balance from what the user gave before the upload
  const bundlrEndingBalance = await bundlrInstance.getLoadedBalance();
  const formattedBundlrEndingBalance = bundlrInstance.utils
    .unitConverter(bundlrEndingBalance)
    .toFixed(4)
    .toString();

  if (formattedBundlrEndingBalance > 0) {
    const userWantsToWithdraw = await confirmWithdraw(
      formattedBundlrEndingBalance,
    );

    if (userWantsToWithdraw) {
      const withdrawTx = await toast
        .promise(bundlrInstance.withdrawBalance(bundlrEndingBalance), {
          pending: `Withdrawing ${formattedBundlrEndingBalance} MATIC...`,
          success: 'Withdrawn successfully!',
          error: 'Failed to withdraw',
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
};

const confirmWithdraw = async (balance) => {
  const isUserConfirmed = await new Promise((resolve, reject) => {
    Modal.confirm({
      title: 'Withdraw remaining balance',
      content: (
        <>
          <p>There are {balance} MATIC remaining in your Bundlr wallet.</p>
          <p className='warning-message' style={{ textAlign: 'left' }}>
            Do you want to withdraw it to your wallet?
          </p>
        </>
      ),
      okText: 'Yes',
      okType: 'primary',
      cancelText: 'No',
      onOk() {
        resolve(true);
      },
      onCancel() {
        return false;
      },
    });
  });

  return isUserConfirmed;
};

export { uploadToArweave, initializeBundlr };

// 3.3608
// 1.0455
