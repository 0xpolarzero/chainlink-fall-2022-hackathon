import styles from '../styles/Home.module.css';
import '../styles/index.css';
import Head from 'next/head';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from 'wagmi/providers/public';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { UploadProvider } from '@w3ui/react-uploader';
import { ToastContainer } from 'react-toastify';
import { useState } from 'react';

// Rainbowkit & Wagmi config
const { chains, provider, webSocketProvider } = configureChains(
  [chain.polygonMumbai],
  [
    jsonRpcProvider({
      rpc: () => ({ http: process.env.NEXT_PUBLIC_MUMBAI_RPC_URL }),
    }),
    publicProvider(),
  ],
);

const { connectors } = getDefaultWallets({
  appName: 'Promise',
  chains,
});

const wagmiClient = createClient({
  provider,
  webSocketProvider,
  autoConnect: true,
  connectors,
});

// Apollo client config
const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_GRAPH_ENDPOINT,
  cache: new InMemoryCache(),
});

function MyApp({ Component, pageProps }) {
  const [activePage, setActivePage] = useState(0);

  return (
    <div className={styles.container}>
      <Head>
        <title>Promise</title>
        <meta name='description' content='Promise app description' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider
          chains={chains}
          modalSize={{
            smallScreen: 'compact',
            largeScreen: 'wide',
          }}
          theme={darkTheme({
            accentColor: 'var(--popstar)',
            accentColorForeground: '#fff',
            borderRadius: 'small',
            fontStack: 'rounded',
            overlayBlur: 'small',
          })}
        >
          <ApolloProvider client={client}>
            {/* <UploadProvider  */}
            <Header activePage={activePage} setActivePage={setActivePage} />
            <Component {...pageProps} setActivePage={setActivePage} />
            {/* <Footer /> */}
          </ApolloProvider>
        </RainbowKitProvider>
      </WagmiConfig>
      <ToastContainer
        theme='colored'
        progressStyle={{ background: '#fff' }}
        position={'bottom-right'}
      />
    </div>
  );
}

export default MyApp;
