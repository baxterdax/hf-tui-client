import fs from 'fs/promises';

export async function ensureDirectoryExists(path: string): Promise<void> {
    try {
        await fs.mkdir(path, { recursive: true });
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
            throw error;
        }
    }
}
