# Configuration and Secrets

## Purpose

This document defines how runtime configuration and secrets should be supplied as the system moves beyond local-only development.

## Configuration Sources

The current runtime supports two input forms for configuration values:

1. direct environment variables
2. file-backed environment variables using the `*_FILE` convention

Direct values take precedence over file-backed values.

Examples:

- `JWT_SECRET`
- `JWT_SECRET_FILE`
- `AUTH_DATABASE_URL`
- `AUTH_DATABASE_URL_FILE`

## Supported Externalization Path

The applications now preload file-backed values during startup. This allows deployment platforms to inject secrets through files while preserving compatibility with local `.env` usage.

This is currently intended for:

- JWT secrets
- database URLs
- other runtime values that may need secret-manager backed delivery later

## Recommended Local Files

- [`.env.example`](../../.env.example) for local non-secret defaults
- [`.env.compose.example`](../../.env.compose.example) for Compose-oriented runtime examples

Do not commit real secret files.

## Resolution Rules

- if `KEY` is set and non-empty, it is used
- otherwise, if `KEY_FILE` is set, the file contents are read and trimmed
- otherwise, the application fallback remains in effect

## Deployment Guidance

### Local development

- use `.env.example` values directly

### Docker Compose

- prefer Compose-specific runtime values based on [`.env.compose.example`](../../.env.compose.example)
- for sensitive values, use `*_FILE` environment variables when mounting secrets or secret-like files

### Future production deployment

- inject secrets from a secret manager or orchestrator-managed file mount
- avoid embedding real JWT secrets or production database URLs in committed env files
- keep service-to-service URLs environment-driven

## Current Scope

This is the first hardening step for config externalization. It does not yet introduce a full secret manager or orchestrator-native secret resource, but it prepares the codebase for that transition.
