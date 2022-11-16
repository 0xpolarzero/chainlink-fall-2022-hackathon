import { toast } from 'react-toastify';
import { useEffect } from 'react';

export default function WelcomeMessage() {
  const message = (
    <>
      Please note that all files sent to Arweave using Bundlr are actually{' '}
      <b>stored only for a week</b>.<br />
      <br /> This is a limitation <b>specific to deploying on a testnet</b>.
    </>
  );

  useEffect(() => {
    toast.info(message, {
      autoClose: false,
      hideProgressBar: true,
    });
  }, []);

  return null;
}
