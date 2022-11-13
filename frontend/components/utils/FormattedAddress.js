import { toast } from 'react-toastify';
import { Popover } from 'antd';
import { useWidth } from '../../systems/hooks/useWidth';
import { useEffect, useState } from 'react';

export default function FormattedAddress({ address, isShrinked, type }) {
  const [shrinkedAddress, setShrinkedAddress] = useState('');
  const [isAddressHovered, setIsAddressHovered] = useState(false);
  const [shouldShrinkAddress, setShouldShrinkAddress] = useState(false);
  const [prefix, setPrefix] = useState('');
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

  useEffect(() => {
    if (type === 'ipfs') setPrefix('https://dweb.link/ipfs/');
    if (type === 'eth') setPrefix('https://mumbai.polygonscan.com/address/');
    if (type === 'arweave') setPrefix('https://arweave.net/');
  }, [type]);

  return (
    <Popover
      content={
        <div className='popover-address'>
          <div>{address}</div>
          <i className='fas fa-copy' onClick={copyAddress}></i>
        </div>
      }
    >
      <a href={`${prefix}${address}`} target='_blank'>
        {shrinkedAddress}
      </a>
      {isAddressHovered && <span className='hint'>{address}</span>}
      {/* </span> */}
    </Popover>
  );
}
