import VerifyTwitterInstructions from './VerifyTwitterInstructions';
import FormattedAddress from '../utils/FormattedAddress';
import networkMapping from '../../constants/networkMapping';
import verifyTwitterAbi from '../../constants/VerifyTwitter.json';
import promiseFactoryAbi from '../../constants/PromiseFactory.json';
import PromisesDataContext from '../../systems/context/PromisesDataContext';
import { waitForChainlinkFullfillment } from '../../systems/tasks/verifyTwitter';
import { Button, Form, Input, Drawer, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { useAccount, useContractWrite, useNetwork, useProvider } from 'wagmi';
import { useContext, useEffect, useState } from 'react';

export default function VerifyTwitterDrawer({ isDrawerOpen, setIsDrawerOpen }) {
  // States
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [isWaitingforVerification, setIsWaitingForVerification] =
    useState(false);
  const [args, setArgs] = useState([]);
  const [verifiedHandles, setVerifiedHandles] = useState([]);
  // Hooks
  const { address: userAddress } = useAccount();
  const { chain } = useNetwork();
  const provider = useProvider();
  const [form] = Form.useForm();
  // Network
  const verifyTwitterAddress =
    networkMapping[(chain && chain.id) || '80001'].VerifyTwitter[0];
  const promiseFactoryAddress =
    networkMapping[chain ? chain.id : '80001'].PromiseFactory[0];

  const { reFetchTwitterVerifiedUsers, twitterVerifiedUsersError } =
    useContext(PromisesDataContext);

  const { write: verifyTwitter } = useContractWrite({
    mode: 'recklesslyUnprepared',
    address: verifyTwitterAddress,
    abi: verifyTwitterAbi,
    functionName: 'requestVerification',
    args: args,
    onSuccess: async (tx) => {
      const txReceipt = await toast.promise(tx.wait(1), {
        pending: 'Requesting verification to the Chainlink Node...',
        success:
          'Request sent! Please wait for the Chainlink Node to fulfill the request.',
        error: 'Error sending request',
      });
      waitForChainlinkFullfillment(
        verifyTwitterAddress,
        verifyTwitterAbi,
        provider,
        args[0],
        setIsWaitingForVerification,
      ).then(() => {
        toast
          .promise(tx.wait(3), {
            pending: 'Please allow TheGraph a few seconds to update...',
            success: `Verified users updated!`,
            error: 'Error updating verified users. Please refresh the page.',
          })
          .then(() => {
            reFetchTwitterVerifiedUsers();
          });
      });
      handleCancel();
    },
    onError: (err) => {
      toast.error('Error sending request');
      console.log('error sending request', err);
      setIsFormDisabled(false);
      setIsWaitingForVerification(false);
    },
  });

  const requestVerification = async () => {
    const formValues = await form.validateFields().catch((err) => {
      console.log(err);
      toast.error('Please use a valid username.');
      return false;
    });

    // Make sure it's not empty (shouldn't happen since the form is validated)
    if (formValues && formValues.twitterHandle) {
      // Remove the @ from the twitter handle if it exists
      formValues.twitterHandle = formValues.twitterHandle
        .replace('@', '')
        .toLowerCase();
    } else {
      return;
    }

    setIsWaitingForVerification(true);
    setIsFormDisabled(true);
    // Trigger useEffect
    setArgs([formValues.twitterHandle]);
  };

  const getVerifiedHandles = async () => {
    const promiseFactoryContract = new ethers.Contract(
      promiseFactoryAddress,
      promiseFactoryAbi,
      provider,
    );

    const handles = await promiseFactoryContract.getTwitterVerifiedHandle(
      userAddress,
    );
    setVerifiedHandles(handles);
  };

  const handleCancel = () => {
    setIsDrawerOpen(false);
    setIsWaitingForVerification(false);
    setIsFormDisabled(false);
    setArgs([]);
    form.resetFields();
  };

  useEffect(() => {
    getVerifiedHandles();
  }, []);

  useEffect(() => {
    if (args.length > 0) {
      verifyTwitter();
    }
  }, [args]);

  return (
    <div>
      <Drawer
        title='Verify Twitter'
        width='80%'
        open={isDrawerOpen}
        onClose={handleCancel}
        extra={
          <div className='form-btns'>
            <Button key='back' onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout='vertical'
          requiredMark={true}
          disabled={isFormDisabled}
        >
          <Form.Item label='Ethereuem Address'>
            <Input
              value={userAddress}
              disabled={true}
              addonAfter={
                <Tooltip title='Your Ethereum address. Please switch wallets if you want to verify with a different address.'>
                  <InfoCircleOutlined />
                </Tooltip>
              }
            />
          </Form.Item>
          <Form.Item
            name='twitterHandle'
            label='Twitter Handle'
            rules={[
              {
                required: true,
                message: 'Missing Twitter handle',
              },
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
                <Tooltip title='The twitter handle must be between 4 and 15 characters long.'>
                  <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                </Tooltip>
              }
            />
          </Form.Item>
          <div className='drawer-item interaction'>
            <VerifyTwitterInstructions
              userAddress={userAddress}
              requestVerification={requestVerification}
              isWaitingforVerification={isWaitingforVerification}
            />
          </div>
          <div className='verified-handles'>
            <h3>Already verified handles</h3>
            {verifiedHandles.length > 0 ? (
              <ul>
                {verifiedHandles.map((handle, index) => (
                  <li key={index}>
                    <a
                      href={`https://twitter.com/${handle}`}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      @{handle}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No verified handles found.</p>
            )}
          </div>
        </Form>
        <div style={{ marginTop: '2rem' }}>
          Or verify from the contract directly:{' '}
          <FormattedAddress
            address={verifyTwitterAddress}
            isShrinked='responsive'
            type='eth-write'
          />{' '}
          <Tooltip
            title={
              <div>
                Interact with the contract on Polygonscan to verify your handle.
                <br />
                <b>{'>'} requestVerification</b>
                <br />
                <br />
                1. Tweet the verification message
                <br />
                2. Enter your Twitter handle as a parameter in{' '}
                <b>requestVerification</b>, and confirm the transaction.
              </div>
            }
          >
            <i className='fas fa-question-circle'></i>
          </Tooltip>
        </div>
      </Drawer>
    </div>
  );
}
