import { toast } from 'react-toastify';
import { useEffect } from 'react';

export default function WelcomeMessage() {
  const message = (
    <>
      Please note that while operating on a tesnet, we are using a{' '}
      <b>Bundlr devnet node</b>.
      <br />
      <br /> This means that files are actually never moved to Arweave, and are{' '}
      <b>cleared after a week</b>.
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
