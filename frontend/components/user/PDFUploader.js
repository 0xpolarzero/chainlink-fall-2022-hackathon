import { formatSize } from '../../systems/utils';
import { Form, Modal, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { useState } from 'react';

const MAX_FILE_SIZE = 100 * 1024 * 1024 - 1; // 100MB

export default function PDFUploader() {
  const { Dragger } = Upload;

  const uploadProps = {
    name: 'pdfFile',
    accept: '.pdf',
    multiple: false,
    directory: false,
    // defaultFileList: [...fileList],
    maxCount: 1,
    maxFileSize: MAX_FILE_SIZE,
    beforeUpload: async (file) => {
      const isCorrectTypeAndSize = checkIsUploadCorrect(file);
      // Wait for user to confirm the upload
      const isUserConfirmed = await confirmUpload(file);

      if (isCorrectTypeAndSize && isUserConfirmed) {
        return true;
      } else {
        return Upload.LIST_IGNORE;
      }
    },
    onChange(info) {
      const { status } = info.file;
      console.log(info);
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        toast.info(`${info.file.name} file dropped successfully.`);
      } else if (status === 'error') {
        toast.error(`${info.file.name} file could not be added.`);
      }
    },
    onDrop(e) {
      // Inform the user if they are trying to upload more than one file
      if (e.dataTransfer.items.length > 1) {
        toast.error('You can only upload one file.');
      }
      // Inform the user if they are trying to upload a file that is too large
      checkIsUploadCorrect(e.dataTransfer.items[0].getAsFile());
    },
  };

  const checkIsUploadCorrect = (file) => {
    // const isPDF = file.type === 'application/pdf';
    // if (!isPDF) {
    //   toast.error('You can only upload a PDF file!');
    // }
    const isLt100MB = file.size < MAX_FILE_SIZE;
    if (!isLt100MB) {
      toast.error('File must be smaller than 100MB!');
    }

    return isLt100MB;
  };

  const confirmUpload = async (file) => {
    const isUserConfirmed = await new Promise((resolve, reject) => {
      Modal.confirm({
        title: 'Confirm Upload',
        content: (
          <>
            <p>Are you sure you want to upload this file?</p>
            <p>
              <b>File Name:</b> {file.name}
            </p>
            <p>
              <b>File Size:</b> {formatSize(file.size)}
            </p>
            <p className='warning-message'>
              <b>Warning:</b> Once you create the promise, this file will be
              uploaded to IPFS and will be publicly available on the internet.
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

  const getFile = (e) => {
    console.log(e);

    if (Array.isArray(e)) {
      return e;
    }

    return e?.fileList;
  };

  return (
    <Form.Item
      label='Upload PDF to IPFS'
      required
      name='upload'
      valuePropName='fileList'
      getValueFromEvent={getFile}
    >
      <Dragger {...uploadProps}>
        <p className='ant-upload-drag-icon'>
          <InboxOutlined />
        </p>
        <p className='ant-upload-text'>
          Click or drag file to this area to upload
        </p>
        <p className='ant-upload-hint'>Max file size is 100MB.</p>
        <h1 className='ant-upload-hint warning-message'>
          <i className='fas fa-exclamation-triangle'></i>
        </h1>
        <p className='ant-upload-hint warning-message underline'>
          Please do not upload any files that contain sensitive information.
        </p>

        <p className='ant-upload-hint warning-message'>
          Uploading a file to IPFS is a permanent action. You will not be able
          to delete it once it is uploaded.
        </p>

        <p className='ant-upload-hint warning-message'>
          Please make sure you have the correct file before uploading.
        </p>
      </Dragger>
    </Form.Item>
  );
}
