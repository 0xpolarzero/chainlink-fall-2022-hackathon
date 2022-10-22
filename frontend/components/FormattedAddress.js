import { toast } from 'react-toastify';
import { Popover } from 'antd';
import { useWidth } from '../systems/useWidth';
import { useEffect, useState } from 'react';

export default function FormattedAddress({ address, isShrinked }) {
  const [shrinkedAddress, setShrinkedAddress] = useState('');
  const [isAddressHovered, setIsAddressHovered] = useState(false);
  const [shouldShrinkAddress, setShouldShrinkAddress] = useState(false);
  const width = useWidth();

  const copyAddress = (e) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard.');
    e.stopPropagation();
  };

  useEffect(() => {
    const shrinkedAddress =
      isShrinked === undefined ||
      isShrinked === true ||
      (isShrinked === 'responsive' && shouldShrinkAddress)
        ? address.slice(0, 6) + '...' + address.slice(-4)
        : address;
    setShrinkedAddress(shrinkedAddress);
  }, [address, width]);

  useEffect(() => {
    if (isShrinked === 'responsive') setShouldShrinkAddress(width < 768);
  }, [width]);

  return (
    <Popover
      content={
        <div className='popover-address'>
          <div>{address}</div>
          <i className='fas fa-copy' onClick={copyAddress}></i>
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
