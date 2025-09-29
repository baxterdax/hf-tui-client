import path from 'path';
import fs from 'fs';
import { downloadFile, DownloadOptions } from './downloader';
import { ModelDetails } from '../types';
import { ensureDirectoryExists } from '../utils/fileSystem';

export interface ModelDownloadOptions {
    modelDetails: ModelDetails;
    outputFolder: string;
    fileName: string;
    token?: string;
    onProgress?: DownloadOptions['onProgress'];
}

export class ModelDownloader {
    public static async download(options: ModelDownloadOptions): Promise<string> {
        const modelFolder = path.join(options.outputFolder, options.modelDetails.id.replace('/', '_'));
        await ensureDirectoryExists(modelFolder);

        // Save model metadata
        const metadataPath = path.join(modelFolder, 'model.json');
        fs.writeFileSync(metadataPath, JSON.stringify(options.modelDetails, null, 2));

        // Download the selected file
        const savedFilePath = await downloadFile({
            modelId: options.modelDetails.id,
            fileName: options.fileName,
            outputFolder: modelFolder,
            token: options.token,
            onProgress: options.onProgress,
        });

        return savedFilePath;
    }
}
