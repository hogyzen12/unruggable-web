'use client';
import { createContext, ReactNode, useContext } from 'react';

export interface Cluster {
  endpoint: string;
  network?: ClusterNetwork;
}

export enum ClusterNetwork {
  Mainnet = 'mainnet-beta',
  Testnet = 'testnet',
  Devnet = 'devnet',
  Custom = 'custom',
}

export interface ClusterProviderContext {
  cluster: Cluster;
}

const Context = createContext<ClusterProviderContext>({} as ClusterProviderContext);

export function ClusterProvider({ children }: { children: ReactNode }) {
  const customRpcUrl = 'https://damp-fabled-panorama.solana-mainnet.quiknode.pro/186133957d30cece76e7cd8b04bce0c5795c164e/';

  const value: ClusterProviderContext = {
    cluster: {
      endpoint: customRpcUrl,
      network: ClusterNetwork.Custom,
    },
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useCluster() {
  return useContext(Context);
}