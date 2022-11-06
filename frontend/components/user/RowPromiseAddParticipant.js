import { Button, Form, Input, Modal, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';

export default function RowPromiseAddParticipant({
  contractAttributes,
  isPromiseLocked,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = () => {
    //
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

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
        <AddParticipantForm form={form} />
      </Modal>
    </>
  );
}

const AddParticipantForm = ({ form }) => {
  return (
    <Form
      className='add-participant-form'
      form={form}
      layout='vertical'
      requiredMark={true}
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
