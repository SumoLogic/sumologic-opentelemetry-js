/// <reference types="node" />
import { Server } from 'http';
interface StartServerConfig {
    basedir: string;
}
interface StartServerResult {
    server: Server;
    port: number;
}
export declare const startServer: ({ basedir }: StartServerConfig) => Promise<StartServerResult>;
export {};
