import styles from '../styles/modules/Home.module.css';
import '../styles/index.css';
import Head from 'next/head';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

import { PromisesDataProvider } from '../systems/context/PromisesDataContext';
// Rainbowkit & Wagmi
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from 'wagmi/providers/public';

import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { ToastContainer } from 'react-toastify';
import { useState } from 'react';

// Configure chains
const { chains, provider, webSocketProvider } = configureChains(
  [chain.polygonMumbai],
  [
    jsonRpcProvider({
      rpc: () => ({ http: process.env.NEXT_PUBLIC_MUMBAI_RPC_URL }),
    }),
    publicProvider(),
  ],
);

// Configure connection
const { connectors } = getDefaultWallets({
  appName: 'Promise',
  chains,
});

// Create client
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
        <meta
          name='description'
          content='Promise is a blockchain service for founders, creators and regular users. The end purpose is to improve trust in our digital relationships and make founders more accountable for their promises.'
        />
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
            <PromisesDataProvider>
              <Header activePage={activePage} setActivePage={setActivePage} />
              <Component {...pageProps} setActivePage={setActivePage} />
              <Footer />
            </PromisesDataProvider>
          </ApolloProvider>
        </RainbowKitProvider>
      </WagmiConfig>
      <ToastContainer position={'bottom-right'} />
    </div>
  );
}

export default MyApp;
