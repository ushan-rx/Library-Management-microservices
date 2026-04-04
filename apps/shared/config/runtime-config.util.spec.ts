import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ConfigService } from '@nestjs/config';
import {
  loadFileBackedEnvironment,
  resolveConfigValue,
  resolveProcessEnvValue,
} from './runtime-config.util';

describe('runtime-config util', () => {
  const originalEnvironment = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnvironment };
  });

  it('resolves values from *_FILE env variables when direct values are absent', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'runtime-config-'));
    const secretPath = join(tempDir, 'jwt-secret.txt');
    writeFileSync(secretPath, 'file-secret\n');

    process.env.JWT_SECRET_FILE = secretPath;

    expect(resolveProcessEnvValue('JWT_SECRET')).toBe('file-secret');

    rmSync(tempDir, { recursive: true, force: true });
  });

  it('prefers direct env values over *_FILE values', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'runtime-config-'));
    const secretPath = join(tempDir, 'jwt-secret.txt');
    writeFileSync(secretPath, 'file-secret\n');

    process.env.JWT_SECRET = 'direct-secret';
    process.env.JWT_SECRET_FILE = secretPath;

    expect(resolveProcessEnvValue('JWT_SECRET')).toBe('direct-secret');

    rmSync(tempDir, { recursive: true, force: true });
  });

  it('hydrates process.env from *_FILE entries', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'runtime-config-'));
    const dbUrlPath = join(tempDir, 'db-url.txt');
    writeFileSync(dbUrlPath, 'postgresql://file-backed\n');

    process.env.AUTH_DATABASE_URL_FILE = dbUrlPath;

    loadFileBackedEnvironment();

    expect(process.env.AUTH_DATABASE_URL).toBe('postgresql://file-backed');

    rmSync(tempDir, { recursive: true, force: true });
  });

  it('resolves ConfigService values from *_FILE entries', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'runtime-config-'));
    const dbUrlPath = join(tempDir, 'db-url.txt');
    writeFileSync(dbUrlPath, 'postgresql://config-file\n');

    const configService = new ConfigService({
      AUTH_DATABASE_URL_FILE: dbUrlPath,
    });

    expect(resolveConfigValue(configService, 'AUTH_DATABASE_URL')).toBe(
      'postgresql://config-file',
    );

    rmSync(tempDir, { recursive: true, force: true });
  });
});
