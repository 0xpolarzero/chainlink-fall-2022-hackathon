import { Modal, Input, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

export default function PromiseModal({ modalOpen, setModalOpen }) {
  const [isFormValid, setIsFormValid] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  // Fields
  const [promiseName, setPromiseName] = useState('');

  const showModal = () => {
    setModalOpen(true);
  };

  const handleSubmit = () => {
    setSubmitLoading(true);
  };

  const handleSuccess = () => {
    setSubmitLoading(false);
    setModalOpen(false);
  };

  const handleCancel = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    // Check if the form is valid
    // The conditions are the same as in the smart contract
    if (promiseName !== '' && promiseName.length <= 70) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }

    // Give some warnings to the user
    if (promiseName !== '' && promiseName.length <= 3) {
      setWarningMessage(
        'You might want to make your promise name a bit longer.',
      );
    } else {
      setWarningMessage('');
    }
  }, [promiseName]);

  return (
    <Modal
      title='Create a new promise'
      open={modalOpen}
      onOk={handleSubmit}
      confirmLoading={submitLoading}
      onCancel={handleCancel}
      okButtonProps={{ disabled: !isFormValid }}
      okText='Create'
    >
      <div className='modal-content'>
        <div className='promise-name'>
          <label htmlFor='promise-name'>Promise name</label>
          <Input
            id='promise-name'
            placeholder='Enter the name of your promise'
            prefix={<i className='fa-solid fa-passport'></i>}
            suffix={
              <Tooltip title="This field is just for information purposes. It can't be longer than 70 characters.">
                <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
              </Tooltip>
            }
            maxLength={70}
            onChange={(e) => setPromiseName(e.target.value)}
          />
        </div>
        upload pdf
        <div className='warning-message'>
          {warningMessage.length > 0 ? warningMessage : null}
        </div>
        <div className='error-message'>
          {errorMessage.length > 0 ? errorMessage : null}
        </div>
      </div>
    </Modal>
    // Prevent name too long
    // Check if addresses are valid
  );
}
