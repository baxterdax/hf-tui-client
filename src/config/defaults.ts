import path from 'path';

import { LogLevel, Settings } from './types';

const DEFAULT_LOG_LEVEL: LogLevel = 'info';

export const DEFAULT_SETTINGS: Settings = {
    apiBaseUrl: 'https://huggingface.co/api',
    huggingFaceToken: '',
    downloadFolder: path.resolve(process.cwd(), 'downloads'),
    modelsFolder: path.resolve(process.cwd(), 'models'),
    datasetsFolder: path.resolve(process.cwd(), 'datasets'),
    cacheFolder: path.resolve(process.cwd(), '.cache'),
    theme: 'dark',
    language: 'en',
    autoUpdate: true,
    logLevel: DEFAULT_LOG_LEVEL,
};
