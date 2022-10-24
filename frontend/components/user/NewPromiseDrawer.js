import PDFUploader from './PDFUploader';
import { validateNewPromiseForm } from '../../systems/validateNewPromiseForm';
import { uploadToIPFS } from '../../systems/uploadToIPFS';
import { Input, Tooltip, Form, Drawer, Space, Button } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useAccount, usePrepareContractWrite, useContractWrite } from 'wagmi';
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function NewPromiseDrawer({ drawerOpen, setDrawerOpen }) {
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const { address: userAddress } = useAccount();

  const showDrawer = () => {
    setDrawerOpen(true);
  };

  const handleSubmit = async () => {
    const {
      promiseName,
      partyNameArray,
      partyAddressArray,
      partyTwitterHandleArray,
      pdfFile,
    } = await validateNewPromiseForm(form);

    // Everything is valid so we can start creating the promise
    setSubmitLoading(true);

    // Upload the PDF to IPFS
    // We assume 'uploadToIPFS' returns a valid CID
    // ... anyway, the smart contract will check it when creating the promise
    const pdfCid = await toast.promise(uploadToIPFS(pdfFile), {
      pending: 'Uploading file to IPFS...',
      success: 'File uploaded successfully!',
      error: 'File could not be uploaded.',
    });

    // Then create the promise

    // Then close the drawer
  };

  const handleSuccess = () => {
    // Handle success...
    handleCancel();
  };

  const handleCancel = () => {
    setDrawerOpen(false);
    setSubmitLoading(false);
    form.resetFields();
  };

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
          >
            Create
          </Button>
        </div>
      }
    >
      <div className='drawer-content'>
        <NewPromiseForm
          userAddress={userAddress}
          form={form}
          submitLoading={submitLoading}
        />
      </div>
    </Drawer>
  );
}

// ----------------------------------------------------------------

const NewPromiseForm = ({ userAddress, form, submitLoading }) => {
  return (
    <Form form={form} layout='vertical' requiredMark={true}>
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
                      message: 'Role must be less than 15 characters',
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

      <PDFUploader />
    </Form>
  );
};