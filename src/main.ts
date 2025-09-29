import { initializeSettings } from './config/settings';
import { startTui } from './ui/app';
import { setupLogger } from './utils/logger';

async function main(): Promise<void> {
    const settings = await initializeSettings();
    const logger = setupLogger(settings.logLevel);

    await startTui(settings, logger);
}

main().catch((error: unknown) => {
    console.error('An error occurred:', error);
    process.exitCode = 1;
});
