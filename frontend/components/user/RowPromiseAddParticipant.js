import networkMapping from '../../constants/networkMapping';
import promiseFactoryAbi from '../../constants/PromiseFactory.json';
import PromisesDataContext from '../../systems/PromisesDataContext';
import { Button, Form, Input, Modal, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { useContractWrite, useNetwork } from 'wagmi';
import { useContext, useEffect, useState } from 'react';

export default function RowPromiseAddParticipant({
  partyAddresses,
  contractAddress: promiseAddress,
  isPromiseLocked,
  gatherPartiesData,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [addParticipantArgs, setAddParticipantArgs] = useState([]);
  const [form] = Form.useForm();
  const { chain } = useNetwork();
  const contractAddress = networkMapping[chain.id || '80001'].PromiseFactory[0];
  const { reFetchPromises, promises, promisesError } =
    useContext(PromisesDataContext);

  useEffect(() => {
    // When a new participant is added, promises get updated
    // Only then, fetch the new parties data
    // gatherPartiesData();
  }, [promises]);

  // It's easier this way to prevent any errors logging in the console
  // + we are sure it will be called only when the args are valid
  const { write: addParticipant } = useContractWrite({
    mode: 'recklesslyUnprepared',
    address: contractAddress,
    abi: promiseFactoryAbi,
    functionName: 'addParticipant',
    args: addParticipantArgs,
    onSuccess: async (tx) => {
      const txReceipt = await toast.promise(tx.wait(1), {
        pending: 'Adding participant...',
        success: `Participant ${addParticipantArgs[1]} added!`,
        error: 'Error adding participant',
      });
      handleCancel();
      reFetchPromises();
    },
    onError: (err) => {
      toast.error('Error adding participant');
      console.log('error adding participant', err);
      setSubmitLoading(false);
      setIsFormDisabled(false);
    },
  });
  // ----------------

  const handleSubmit = async () => {
    const formValues = await form.validateFields().catch((err) => {
      console.log(err);
      toast.error('Please fill all the fields correctly.');
      return false;
    });

    if (!formValues) return;

    // If the address is already owner by a participant, don't add it
    if (
      partyAddresses
        .map((address) => address.toLowerCase())
        .includes(formValues.participantAddress.toLowerCase())
    ) {
      toast.error('This address is already registered as a participant.');
      return;
    }

    // Make sure it's not empty
    if (formValues.partyTwitterHandle) {
      // Remove the @ from the twitter handle if it exists
      formValues.partyTwitterHandle = formValues.partyTwitterHandle
        .replace('@', '')
        .toLowerCase();
    } else {
      formValues.partyTwitterHandle = '';
    }

    // Now the participant can be added
    setSubmitLoading(true);
    setIsFormDisabled(true);
    setAddParticipantArgs([
      promiseAddress,
      formValues.participantName,
      formValues.participantTwitterHandle,
      formValues.participantAddress,
    ]);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSubmitLoading(false);
    setIsFormDisabled(false);
    form.resetFields();
    setAddParticipantArgs([]);
  };

  useEffect(() => {
    if (addParticipantArgs.length === 4) {
      addParticipant();
    }
  }, [addParticipantArgs]);

  return (
    <>
      <div className='drawer-item-title'>
        New participant{' '}
        <Tooltip
          title={
            <div>
              Add a new participant to the promise.
              <br />
              <b>
                <i className='fas fa-warning' /> Warning:
              </b>{' '}
              Once you add a participant, the promise will be disapproved for
              every participants.{' '}
              <b>
                They will need to approve it again, which will require to send a
                new transaction.
              </b>
            </div>
          }
        >
          {' '}
          <i className='fas fa-question-circle'></i>
        </Tooltip>
      </div>
      <Tooltip
        title={'No participant can be added once the promise is locked.'}
      >
        <Button
          type='primary'
          onClick={() => setIsModalOpen(true)}
          disabled={isPromiseLocked}
        >
          <i className='fas fa-user-plus' /> Add a participant
        </Button>
      </Tooltip>

      <Modal
        title='Add participant'
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText='Add'
        okButtonProps={{ disabled: submitLoading, loading: submitLoading }}
      >
        <AddParticipantForm form={form} isFormDisabled={isFormDisabled} />
      </Modal>
    </>
  );
}

const AddParticipantForm = ({ form, isFormDisabled }) => {
  return (
    <Form
      className='add-participant-form'
      form={form}
      layout='vertical'
      requiredMark={true}
      disabled={isFormDisabled}
    >
      <Form.Item
        name='participantName'
        label='Name'
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
              <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
            </Tooltip>
          }
        />
      </Form.Item>

      <Form.Item
        name='participantAddress'
        label='Ethereum address'
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
            pattern: /^(?!.*?(0x0000000000000000000000000000000000000000)).*$/,
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
              <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
            </Tooltip>
          }
        />
      </Form.Item>

      <Form.Item
        name='participantTwitterHandle'
        label='Twitter username'
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
              <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
            </Tooltip>
          }
        />
      </Form.Item>
    </Form>
  );
};
