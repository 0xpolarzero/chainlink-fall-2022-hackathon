import { toast } from 'react-toastify';
import { Popover } from 'antd';
import { useEffect, useState } from 'react';

export default function ShrinkedAddress({ address }) {
  const [shrinkedAddress, setShrinkedAddress] = useState('');
  const [isAddressHovered, setIsAddressHovered] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard.');
  };

  useEffect(() => {
    const shrinkedAddress = address.slice(0, 6) + '...' + address.slice(-4);
    setShrinkedAddress(shrinkedAddress);
  }, [address]);

  return (
    <span className='address-wrapper'>
      <Popover content={address}>
        <span
          onMouseEnter={() => setIsAddressHovered(true)}
          onMouseLeave={() => setIsAddressHovered(false)}
          className='address'
        >
          <a
            href={`https://mumbai.polygonscan.com/address/${address}`}
            target='_blank'
          >
            {shrinkedAddress}
          </a>
          {isAddressHovered && <span className='hint'>{address}</span>}
        </span>
      </Popover>
      <i className='fa-solid fa-copy' onClick={copyAddress}></i>
    </span>
  );
}
