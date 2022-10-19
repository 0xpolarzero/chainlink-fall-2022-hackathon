import { toast } from 'react-toastify';
import { Popover } from 'antd';
import { useEffect, useState } from 'react';

export default function ShrinkedAddress({ address }) {
  const [shrinkedAddress, setShrinkedAddress] = useState('');
  const [isAddressHovered, setIsAddressHovered] = useState(false);

  const copyAddress = (e) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard.');
    e.stopPropagation();
  };

  useEffect(() => {
    const shrinkedAddress = address.slice(0, 6) + '...' + address.slice(-4);
    setShrinkedAddress(shrinkedAddress);
  }, [address]);

  return (
    <Popover
      content={
        <div className='popover-address'>
          <div>{address}</div>
          <i className='fa-solid fa-copy' onClick={copyAddress}></i>
        </div>
      }
    >
      <a
        href={`https://mumbai.polygonscan.com/address/${address}`}
        target='_blank'
      >
        {shrinkedAddress}
      </a>
      {isAddressHovered && <span className='hint'>{address}</span>}
      {/* </span> */}
    </Popover>
  );
}
