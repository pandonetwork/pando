import { WebsocketProvider } from 'web3/providers';
export interface PWebsocketProvider extends WebsocketProvider {
    connection: {
        onclose(e: any): void;
        onmessage(e: any): void;
        onerror(e?: any): void;
        close(): void;
    };
}
export interface IPandoOptions {
    ethereum: IEthereumOptions;
    apm?: APMOptions;
}
export interface IEthereumOptions {
    account: string;
    gateway?: Gateway;
    provider?: PWebsocketProvider;
}
export interface PandoOptions {
    ethereum: EthereumOptions;
    apm: APMOptions;
}
export interface EthereumOptions {
    account: string;
    provider: PWebsocketProvider;
}
export interface APMOptions {
    ens: string;
}
export interface Gateway {
    protocol: 'ws' | 'http';
    host: string;
    port: string;
}
