import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { buildModelFileDownloadUrl } from './huggingface';
import { ensureDirectoryExists } from '../utils/fileSystem';

export interface DownloadOptions {
    modelId: string;
    fileName: string;
    outputFolder: string;
    token?: string;
    revision?: string;
    onProgress?: (progress: { percent: number; speed: string; remaining: string }) => void;
}

export async function downloadFile({
    modelId,
    fileName,
    outputFolder,
    token,
    revision = 'main',
    onProgress,
}: DownloadOptions): Promise<string> {
    const downloadUrl = buildModelFileDownloadUrl(modelId, fileName, revision);
    await ensureDirectoryExists(outputFolder);
    const outputPath = path.join(outputFolder, fileName);
    const writer = fs.createWriteStream(outputPath);

    try {
        const response = await axios.get(downloadUrl, {
            responseType: 'stream',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const totalSize = Number.parseInt(response.headers['content-length'] ?? '0', 10);
        let downloadedSize = 0;
        const startTime = Date.now();

        response.data.on('data', (chunk: Buffer) => {
            downloadedSize += chunk.length;
            if (onProgress && totalSize > 0) {
                const percent = Math.round((downloadedSize / totalSize) * 100);
                const elapsed = (Date.now() - startTime) / 1000;
                const speed = downloadedSize / elapsed;
                const remainingTime = (totalSize - downloadedSize) / speed;
                onProgress({
                    percent,
                    speed: `${(speed / 1024 / 1024).toFixed(2)} MB/s`,
                    remaining: `${Math.round(remainingTime)}s`,
                });
            }
        });

        response.data.pipe(writer);

        await new Promise<void>((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', (err) => {
                fs.unlink(outputPath, () => reject(err));
            });
            response.data.on('error', (err: Error) => {
                writer.close();
                fs.unlink(outputPath, () => reject(err));
            });
        });

        return outputPath;
    } catch (error) {
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
        throw error;
    }
}
