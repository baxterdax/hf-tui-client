import { LogLevel } from '../config/types';

export interface Logger {
    debug(message: string, meta?: Record<string, unknown>): void;
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, meta?: Record<string, unknown>): void;
    setLevel(level: LogLevel): void;
}

class ConsoleLogger implements Logger {
    private level: LogLevel = 'info';

    setLevel(level: LogLevel): void {
        this.level = level;
    }

    private canLog(level: LogLevel): boolean {
        const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
        return levels.indexOf(level) >= levels.indexOf(this.level);
    }

    debug(message: string, meta?: Record<string, unknown>): void {
        if (!this.canLog('debug')) return;
        console.debug(message, meta ?? '');
    }

    info(message: string, meta?: Record<string, unknown>): void {
        if (!this.canLog('info')) return;
        console.log(message, meta ?? '');
    }

    warn(message: string, meta?: Record<string, unknown>): void {
        if (!this.canLog('warn')) return;
        console.warn(message, meta ?? '');
    }

    error(message: string, meta?: Record<string, unknown>): void {
        if (!this.canLog('error')) return;
        console.error(message, meta ?? '');
    }
}

export function setupLogger(level: LogLevel): Logger {
    const logger = new ConsoleLogger();
    logger.setLevel(level);
    return logger;
}
