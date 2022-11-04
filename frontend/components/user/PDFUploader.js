import { formatSize } from '../../systems/utils';
import { Form, Modal, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';

const MAX_SIZE = 100 * 1024 * 1024 - 1; // 100MB

export default function PDFUploader() {
  const [fileList, setFileList] = useState([]);
  const [totalSize, setTotalSize] = useState(0);
  const { Dragger } = Upload;

  const uploadProps = {
    name: 'file',
    multiple: false,
    directory: false,

    beforeUpload: async (file) => {
      // Don't allow directories
      if (file.type === '') {
        toast.error('Please upload files one at a time');
        return Upload.LIST_IGNORE;
      }

      let fileListSize = getTotalSize(fileList);
      // If it exceeds the max size, don't add the last file
      if (fileListSize + file.size > MAX_SIZE) {
        toast.error(`Total size exceeds ${formatSize(MAX_SIZE)}`);
        return Upload.LIST_IGNORE;
      } else {
        setTotalSize(fileListSize + file.size);
        setFileList([...fileList, file]);
        toast.info(`Added ${file.name}`);
      }
      console.log('fileList', file);
    },

    onRemove: (file) => {
      setTotalSize(getTotalSize(fileList) - file.size);
      setFileList(fileList.filter((f) => f.uid !== file.uid));
      toast.info(`Removed ${file.name}`);
    },
  };

  const getTotalSize = (files) => {
    if (files.length === 0) return 0;
    return files.reduce((acc, file) => acc + file.size, 0);
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
      <Dragger {...uploadProps} fileList={fileList}>
        <p className='ant-upload-drag-icon'>
          <InboxOutlined />
        </p>
        <p className='ant-upload-text'>
          Click or drag file to this area to upload
        </p>
        <p className='ant-upload-hint'>{formatSize(totalSize)} / 100MB</p>
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
