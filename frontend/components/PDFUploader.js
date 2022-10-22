import { Form, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';

const MAX_FILE_SIZE = 100 * 1024 * 1024 - 1; // 100MB

export default function PDFUploader() {
  const { Dragger } = Upload;

  const uploadProps = {
    name: 'pdfFile',
    accept: '.pdf',
    multiple: false,
    directory: false,
    progress: {
      strokeColor: {
        '0%': '#108ee9',
        '100%': '#87d068',
      },
      strokeWidth: 3,
      format: (percent) => `${parseFloat(percent.toFixed(2))}%`,
    },
    maxCount: 1,
    maxFileSize: MAX_FILE_SIZE,
    customRequest: async ({ file, onSuccess }) => {
      const fileURI = await uploadToIPFS(file);
    },
    // action: uploadToIPFS,
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        toast.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        toast.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      // Inform the user if they are trying to upload more than one file
      if (e.dataTransfer.items.length > 1) {
        toast.error('You can only upload one file.');
      }
      // Inform the user if they are trying to upload a file that is too large
      if (e.dataTransfer.items[0].size > MAX_FILE_SIZE) {
        toast.error('You can only upload files that are less than 100MB.');
      }
      // Inform the user if they are trying to upload a file that is not a PDF
      if (e.dataTransfer.items[0].type !== 'application/pdf') {
        toast.error('You can only upload PDF files.');
      }

      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  const uploadToIPFS = async (file) => {
    console.log('Received this file', file);
  };

  return (
    <Form.Item label='Upload PDF to IPFS' required>
      <Dragger {...uploadProps}>
        <p className='ant-upload-drag-icon'>
          <InboxOutlined />
        </p>
        <p className='ant-upload-text'>
          Click or drag file to this area to upload
        </p>
        <p className='ant-upload-hint'>
          Only accepts PDF files. Max file size is 100MB.
        </p>
        <h1 className='ant-upload-hint warning-message'>
          <i className='fas fa-exclamation-triangle'></i>
        </h1>
        <p className='ant-upload-hint warning-message'>
          Please keep in mind that uploading a file to IPFS is a permanent
          action. You will not be able to delete the file once it is uploaded.
          Please make sure you have the correct file before uploading. Do not
          upload any files that contain sensitive information.
        </p>
      </Dragger>
    </Form.Item>
  );
}
