import { Button } from 'antd';
import { useEffect, useState } from 'react';
import { useNetwork, useSigner } from 'wagmi';
import { initializeBundlr } from '../..//systems/tasks/uploadToArweave';

export default function ConnectBundlr({ bundlr, setBundlr }) {
  const [chainId, setChainId] = useState('80001');
  const [provider, setProvider] = useState(null);
  const { chain } = useNetwork();
  const { data: signer } = useSigner();

  useEffect(() => {
    if (signer) {
      setProvider(signer.provider);
    }
  }, [signer]);

  useEffect(() => {
    if (chain) {
      setChainId(chain.id);
    }
  }, [chain]);

  return (
    <div>
      <Button
        type='primary'
        onClick={async () => {
          const bundlrInitialized = await initializeBundlr(provider, chainId);
          setBundlr({
            instance: bundlrInitialized.instance,
            isReady: bundlrInitialized.isReady,
            provider: provider,
          });
        }}
        disabled={bundlr.isReady}
      >
        {bundlr.isReady ? (
          <span>
            <i className='fas fa-check' /> Connected to Bundlr (Arweave)
          </span>
        ) : (
          'Connect to Bundlr (Arweave)'
        )}
      </Button>
    </div>
  );
}
