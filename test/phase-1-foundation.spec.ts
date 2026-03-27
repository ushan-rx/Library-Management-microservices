import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Phase 1 development foundation', () => {
  const projectRoot = process.cwd();

  it('defines the required shared environment contract', () => {
    const envExample = readFileSync(join(projectRoot, '.env.example'), 'utf8');

    [
      'POSTGRES_HOST=',
      'POSTGRES_PORT=',
      'POSTGRES_USER=',
      'POSTGRES_PASSWORD=',
      'API_GATEWAY_PORT=3000',
      'AUTH_DATABASE_URL=',
      'MEMBER_DATABASE_URL=',
      'CATEGORY_DATABASE_URL=',
      'BOOK_DATABASE_URL=',
      'BORROW_DATABASE_URL=',
      'FINE_DATABASE_URL=',
      'JWT_SECRET=',
    ].forEach((requiredEntry) => {
      expect(envExample).toContain(requiredEntry);
    });
  });

  it('defines a dockerized postgres resource with initialization and health checks', () => {
    const composeFile = readFileSync(
      join(projectRoot, 'docker-compose.yml'),
      'utf8',
    );

    expect(composeFile).toContain('postgres-core:');
    expect(composeFile).toContain('postgres:16-alpine');
    expect(composeFile).toContain(
      './docker/postgres/init:/docker-entrypoint-initdb.d:ro',
    );
    expect(composeFile).toContain('healthcheck:');
    expect(composeFile).toContain('pg_isready');
  });

  it('provides prisma schema scaffolding for every service database owner', () => {
    const schemaPaths = [
      'apps/auth-service/prisma/schema.prisma',
      'apps/member-service/prisma/schema.prisma',
      'apps/category-service/prisma/schema.prisma',
      'apps/book-service/prisma/schema.prisma',
      'apps/borrow-service/prisma/schema.prisma',
      'apps/fine-payment-service/prisma/schema.prisma',
    ];

    schemaPaths.forEach((relativePath) => {
      const absolutePath = join(projectRoot, relativePath);

      expect(existsSync(absolutePath)).toBe(true);
      expect(readFileSync(absolutePath, 'utf8')).toContain(
        'url      = env("DATABASE_URL")',
      );
    });
  });

  it('documents the shared startup and correlation conventions', () => {
    const docPath = join(
      projectRoot,
      'docs/shared/PHASE_1_DEVELOPMENT_FOUNDATION.md',
    );

    expect(existsSync(docPath)).toBe(true);

    const phaseDoc = readFileSync(docPath, 'utf8');
    expect(phaseDoc).toContain('Request Correlation Plan');
    expect(phaseDoc).toContain('Prisma Foundation');
    expect(phaseDoc).toContain('PostgreSQL Provisioning Plan');
  });
});
