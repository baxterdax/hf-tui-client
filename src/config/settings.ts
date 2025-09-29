import fs from 'fs/promises';
import path from 'path';

import { ensureDirectoryExists } from '../utils/fileSystem';
import { DEFAULT_SETTINGS } from './defaults';
import { LogLevel, Settings } from './types';

const CONFIG_DIRECTORY = path.resolve(process.cwd(), 'config');
const CONFIG_PATH = path.join(CONFIG_DIRECTORY, 'config.json');

async function loadSettingsFromDisk(): Promise<Partial<Settings> | null> {
    try {
        const fileContents = await fs.readFile(CONFIG_PATH, 'utf-8');
        return JSON.parse(fileContents) as Partial<Settings>;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return null;
        }
        throw error;
    }
}

function mergeSettings(partial: Partial<Settings> | null): Settings {
    return {
        ...DEFAULT_SETTINGS,
        ...partial,
        huggingFaceToken: partial?.huggingFaceToken ?? DEFAULT_SETTINGS.huggingFaceToken,
        logLevel: (partial?.logLevel ?? DEFAULT_SETTINGS.logLevel) as LogLevel,
        theme: (partial?.theme ?? DEFAULT_SETTINGS.theme),
        language: partial?.language ?? DEFAULT_SETTINGS.language,
    };
}

async function ensureWorkspaceDirectories(settings: Settings): Promise<void> {
    await Promise.all([
        ensureDirectoryExists(settings.downloadFolder),
        ensureDirectoryExists(settings.modelsFolder),
        ensureDirectoryExists(settings.datasetsFolder),
        ensureDirectoryExists(settings.cacheFolder),
    ]);
}

export async function initializeSettings(): Promise<Settings> {
    const partialSettings = await loadSettingsFromDisk();
    const settings = mergeSettings(partialSettings);

    await ensureDirectoryExists(CONFIG_DIRECTORY);
    await ensureWorkspaceDirectories(settings);
    await saveSettings(settings);

    return settings;
}

export async function saveSettings(settings: Settings): Promise<void> {
    await ensureDirectoryExists(CONFIG_DIRECTORY);
    await fs.writeFile(CONFIG_PATH, JSON.stringify(settings, null, 2), 'utf-8');
}

export { Settings, LogLevel };
