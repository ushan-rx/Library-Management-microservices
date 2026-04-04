import { readFileSync } from 'node:fs';
import type { ConfigService } from '@nestjs/config';

function readValueFromFile(filePath: string, key: string): string {
  try {
    return readFileSync(filePath, 'utf8').trim();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown file read error';
    throw new Error(
      `Failed to load configuration value for ${key} from file ${filePath}: ${message}`,
    );
  }
}

export function resolveProcessEnvValue(
  key: string,
  fallback?: string,
): string | undefined {
  const directValue = process.env[key];
  if (directValue && directValue.trim() !== '') {
    return directValue;
  }

  const filePath = process.env[`${key}_FILE`];
  if (filePath && filePath.trim() !== '') {
    return readValueFromFile(filePath, key);
  }

  return fallback;
}

export function resolveConfigValue(
  configService: ConfigService,
  key: string,
  fallback?: string,
): string | undefined {
  const directValue = configService.get<string>(key);
  if (directValue && directValue.trim() !== '') {
    return directValue;
  }

  const filePath = configService.get<string>(`${key}_FILE`);
  if (filePath && filePath.trim() !== '') {
    return readValueFromFile(filePath, key);
  }

  return fallback;
}

export function loadFileBackedEnvironment(): void {
  Object.entries(process.env).forEach(([key, value]) => {
    if (!key.endsWith('_FILE')) {
      return;
    }

    const baseKey = key.slice(0, -'_FILE'.length);
    if (!value || value.trim() === '') {
      return;
    }

    const existingValue = process.env[baseKey];
    if (existingValue && existingValue.trim() !== '') {
      return;
    }

    process.env[baseKey] = readValueFromFile(value, baseKey);
  });
}
