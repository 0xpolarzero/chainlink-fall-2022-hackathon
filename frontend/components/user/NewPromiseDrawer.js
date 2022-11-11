import FileUploader from './FileUploader';
import ConnectBundlr from './ConnectBundlr';
import { validateNewPromiseForm } from '../../systems/validateNewPromiseForm';
import { uploadToIPFS } from '../../systems/uploadToIPFS';
import { uploadToArweave } from '../../systems/uploadToArweave';
import { encryptAES256 } from '../../systems/encryptAES256';
import networkMapping from '../../constants/networkMapping';
import promiseFactoryAbi from '../../constants/PromiseFactory.json';
import { Input, Tooltip, Form, Drawer, Space, Button, Switch } from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useAccount, useBalance, useNetwork, useContractWrite } from 'wagmi';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function NewPromiseDrawer({ drawerOpen, setDrawerOpen }) {
  // Form and submit
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [createPromiseArgs, setCreatePromiseArgs] = useState([]);
  const [form] = Form.useForm();
  // IPFS
  const [ipfsUploadProgress, setIpfsUploadProgress] = useState(0);
  // Bundlr
  const [bundlr, setBundlr] = useState({
    instance: null,
    isReady: false,
  });
  const [isArweaveChecked, setIsArweaveChecked] = useState(true);

  const [statusMessage, setStatusMessage] = useState('');
  const { address: userAddress } = useAccount();
  const { data: userBalance } = useBalance({ addressOrName: userAddress });
  const { chain } = useNetwork();
  const contractAddress = networkMapping[chain.id || '80001'].PromiseFactory[0];

  const { write: createPromise } = useContractWrite({
    mode: 'recklesslyUnprepared',
    address: contractAddress,
    abi: promiseFactoryAbi,
    functionName: 'createPromiseContract',
    args: createPromiseArgs,
    onSuccess: async (tx) => {
      const txReceipt = await toast.promise(tx.wait(1), {
        pending: 'Creating promise...',
        success: 'Promise created!',
        error: 'Error creating promise',
      });
      handleCancel();
    },
    onError: (err) => {
      toast.error('Error creating promise');
      console.log('error creating promise', err);
      setSubmitLoading(false);
      setIsFormDisabled(false);
      setStatusMessage('');
    },
  });
  // ----------------

  const handleSubmit = async () => {
    const formValues = await validateNewPromiseForm(form);

    if (!formValues) {
      return;
    }

    if (isArweaveChecked && !bundlr.instance) {
      toast.error('Please connect to Bundlr');
      return;
    }

    // Everything is valid so we can start creating the promise
    setSubmitLoading(true);
    // Disable the form inputs while the promise is being created
    setIsFormDisabled(true);

    // Upload the files to IPFS
    // If it doesn't work, it will return false
    setStatusMessage(`Uploading files to IPFS... ${ipfsUploadProgress}%`);
    const ipfsCid = await toast.promise(
      uploadToIPFS(formValues.files, setIpfsUploadProgress),
      {
        pending: `Uploading files to IPFS...`,
        success: `Files uploaded to IPFS!`,
        error: `Error uploading files to IPFS`,
      },
    );

    // If the upload failed, show an error toast and return
    if (!ipfsCid) {
      setSubmitLoading(false);
      setIsFormDisabled(false);
      return;
    }

    // Upload to Arweave
    let arweaveId = '';
    if (isArweaveChecked) {
      arweaveId = await uploadToArweave(
        bundlr,
        userBalance,
        formValues.files,
        formValues.promiseName,
        setStatusMessage,
      );

      if (!arweaveId) {
        setSubmitLoading(false);
        setIsFormDisabled(false);
        return;
      }
    }

    // Set a unique identifier attesting that the promise was created using the website
    // So we are sure the files have been sent to both IPFS and Arweave
    // This will allow the promise to be displayed as more 'trustworthy' on the UI
    // It is not a very decentralized solution, but it is a good start for making sure the data
    // will indeed be persisted on IPFS and Arweave
    // The key is generated using the following parameters,
    // a 256 bit AES encryption key, and a 128 bit IV
    setStatusMessage(
      'Encrypting the proof that your files have indeed been uploaded...',
    );
    const encryptedProof = encryptAES256(userAddress, ipfsCid, arweaveId);

    // Then create the promise
    // This will trigger the useEffect hook (to make sure the args are filled)
    setStatusMessage('Waiting for you to confirm the transaction...');
    setCreatePromiseArgs([
      formValues.promiseName,
      ipfsCid,
      arweaveId,
      encryptedProof,
      formValues.partyNameArray,
      formValues.partyTwitterHandleArray,
      formValues.partyAddressArray,
    ]);
  };

  const handleCancel = () => {
    setDrawerOpen(false);
    setSubmitLoading(false);
    form.resetFields();
    setIsFormDisabled(false);
    setCreatePromiseArgs([]);
    setIpfsUploadProgress(0);
    setStatusMessage('');
  };

  useEffect(() => {
    // Don't fire on first render or when the args are reset
    if (createPromiseArgs.length === 7) {
      createPromise();
    }
  }, [createPromiseArgs]);

  return (
    <Drawer
      title='Create a new promise'
      width='80%'
      open={drawerOpen}
      onClose={handleCancel}
      extra={
        <div className='form-btns'>
          <Button key='back' onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            key='submit'
            type='primary'
            htmlType='submit'
            onClick={handleSubmit}
            loading={submitLoading}
            disabled={submitLoading}
          >
            Create
          </Button>
        </div>
      }
    >
      <div className='drawer-content'>
        {submitLoading ? (
          <div className='info-message'>{statusMessage}</div>
        ) : null}
        <NewPromiseForm
          userAddress={userAddress}
          form={form}
          submitLoading={submitLoading}
          isFormDisabled={isFormDisabled}
          isArweaveChecked={isArweaveChecked}
          setIsArweaveChecked={setIsArweaveChecked}
          bundlr={bundlr}
          setBundlr={setBundlr}
        />
      </div>
    </Drawer>
  );
}

// ----------------------------------------------------------------

const NewPromiseForm = ({
  userAddress,
  form,
  submitLoading,
  isFormDisabled,
  isArweaveChecked,
  setIsArweaveChecked,
  bundlr,
  setBundlr,
}) => {
  return (
    <Form
      form={form}
      layout='vertical'
      requiredMark={true}
      disabled={isFormDisabled}
    >
      <Form.Item
        name='promiseName'
        label='Promise name'
        rules={[
          {
            required: true,
            message: 'Please enter a name for your promise',
          },
          {
            max: 70,
            message: 'The promise name must be less than 70 characters',
          },
          {
            type: 'string',
            warningOnly: true,
            min: 3,
            message: 'You might want to make your promise name a bit longer',
          },
        ]}
      >
        <Input
          id='promise-name'
          placeholder='Enter the name of your promise'
          prefix={<i className='fas fa-address-card'></i>}
          suffix={
            <Tooltip title="This field is just for information purposes. It can't be longer than 70 characters.">
              <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
            </Tooltip>
          }
        />
      </Form.Item>

      <Form.List name='parties' initialValue={[{ partyAddress: userAddress }]}>
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, i) => (
              <Space
                key={field.key}
                style={{ display: 'flex', marginBottom: 8 }}
                align='center'
              >
                <Form.Item
                  {...field}
                  name={[field.name, 'partyName']}
                  key={[field.key, 'partyName']}
                  // Put a label only if it's the first field
                  label={i === 0 ? 'Name' : null}
                  rules={[
                    {
                      required: true,
                      message: 'Missing name',
                    },
                    {
                      type: 'string',
                      message: 'Name must be a string',
                    },
                    {
                      min: 2,
                      message: 'Name must be at least 2 characters',
                    },
                    {
                      max: 30,
                      message: 'Name must be less than 30 characters',
                    },
                  ]}
                >
                  <Input
                    placeholder='John'
                    prefix={<i className='fas fa-user-tag'></i>}
                    suffix={
                      <Tooltip title='The name of the participant must be between 2 and 30 characters long.'>
                        <InfoCircleOutlined
                          style={{ color: 'rgba(0,0,0,.45)' }}
                        />
                      </Tooltip>
                    }
                  />
                </Form.Item>

                <Form.Item
                  {...field}
                  name={[field.name, 'partyAddress']}
                  key={[field.key, 'partyAddress']}
                  label={i === 0 ? 'Ethereum address' : null}
                  rules={[
                    {
                      required: true,
                      message: 'Missing address',
                    },
                    {
                      type: 'string',
                      message: 'Address must be a number',
                    },
                    // Make sure it is an ethereum address
                    {
                      pattern: /^0x[a-fA-F0-9]{40}$/,
                      min: 42,
                      max: 42,
                      message: 'Address must be a valid ethereum address',
                    },
                    // Make sure it's not the dead address
                    {
                      pattern:
                        /^(?!.*?(0x0000000000000000000000000000000000000000)).*$/,
                      message: 'You might want to use a different address...',
                      warningOnly: true,
                    },
                  ]}
                >
                  <Input
                    placeholder='0xc06...EF'
                    prefix={<i className='fa-brands fa-ethereum'></i>}
                    suffix={
                      <Tooltip title='The address of the participant must be a valid ethereum address.'>
                        <InfoCircleOutlined
                          style={{ color: 'rgba(0,0,0,.45)' }}
                        />
                      </Tooltip>
                    }
                  />
                </Form.Item>

                <Form.Item
                  {...field}
                  name={[field.name, 'partyTwitterHandle']}
                  key={[field.key, 'partyTwitterHandle']}
                  label={i === 0 ? 'Twitter username' : null}
                  rules={[
                    {
                      pattern: /^@?[a-zA-Z0-9_]{1,15}$/,
                      message: 'The username is not valid',
                    },
                    {
                      min: 4,
                      message: 'Twitter handle must be at least 4 characters',
                    },
                    {
                      max: 15,
                      message: 'Twitter handle must be less than 15 characters',
                    },
                  ]}
                >
                  <Input
                    placeholder='username'
                    prefix={
                      <span className='icon-double'>
                        <i className='fa-brands fa-twitter'></i>
                        <i className='fas fa-at'></i>
                      </span>
                    }
                    suffix={
                      <Tooltip title='The twitter handle must be between 4 and 15 characters long. It is not required to provide one, but it is highly recommanded.'>
                        <InfoCircleOutlined
                          style={{ color: 'rgba(0,0,0,.45)' }}
                        />
                      </Tooltip>
                    }
                  />
                </Form.Item>

                <i
                  className='fas fa-trash'
                  onClick={() => {
                    // Prevent the user from removing the field if there is only one left
                    if (fields.length > 1) {
                      remove(field.name);
                    } else {
                      toast.warning('You need at least one participant');
                    }
                  }}
                ></i>
              </Space>
            ))}
            <Form.Item>
              <Button
                type='primary'
                disabled={submitLoading}
                onClick={() => {
                  add();
                }}
                block
              >
                <i className='fas fa-plus'></i> Add participant
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <Form.Item
        label='Where do you want to upload the files?'
        name='storage'
        className='form-upload-choice'
      >
        <div>
          <span>
            IPFS{' '}
            <Tooltip title='IPFS is a decentralized storage network. Your files will be sent to the network and become available to be downloaded, and pinned by other users. We will be the first ones to pin your files through Web3.Storage & Filecoin.'>
              <i className='fas fa-question-circle' />
            </Tooltip>
          </span>
          <Switch
            checked
            disabled
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
          />
        </div>
        <div>
          <span>
            Arweave{' '}
            <Tooltip
              title={
                <div>
                  Your files will be sent to the permaweb, on the Arweave
                  blockchain. This is an additional option, but highly
                  recommanded, as it is a sign of trust and permanence. You will
                  first need to connect your wallet to the network (operated by
                  Bundlr, a L2 on Arweave), and pay for the transaction fees.
                  <br />
                  <b>
                    If successfully backed up, a verified badge will be
                    displayed on your promise.
                  </b>
                </div>
              }
            >
              <i className='fas fa-question-circle' />
            </Tooltip>
          </span>
          <Switch
            defaultChecked
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            onChange={(checked) => setIsArweaveChecked(checked)}
          />
        </div>
      </Form.Item>
      {isArweaveChecked ? (
        <ConnectBundlr bundlr={bundlr} setBundlr={setBundlr} />
      ) : null}

      <FileUploader />
    </Form>
  );
};
