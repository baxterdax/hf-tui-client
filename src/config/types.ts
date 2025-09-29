export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Settings {
    apiBaseUrl: string;
    huggingFaceToken: string;
    downloadFolder: string;
    modelsFolder: string;
    datasetsFolder: string;
    cacheFolder: string;
    theme: 'light' | 'dark';
    language: string;
    autoUpdate: boolean;
    logLevel: LogLevel;
}
