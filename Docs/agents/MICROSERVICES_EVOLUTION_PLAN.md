# Microservices Evolution Plan

## Purpose

This document captures the next engineering priorities for evolving the current library system from a microservices-oriented monorepo into a more complete operational microservices implementation.

The current codebase already has:

- separate domain services
- separate databases per service
- an API Gateway
- direct service-to-service HTTP communication
- end-to-end business flows through the gateway

The next work is about operational independence, runtime isolation, and production-readiness.

## Priority 1: Containerize Every Service

### Goal

Run each application as its own container instead of relying on local Node.js processes.

### Tasks

- add a container build for every application
- ensure Prisma client generation happens during image build
- ensure each database-owning service can prepare its schema at startup
- update Docker Compose so the gateway and all services run on an internal network
- expose stable health checks for container orchestration

### Started in this repo

- add a shared Node service Docker build
- expand `docker-compose.yml` for all services
- add container-oriented startup scripts to the repo docs

## Priority 2: Deploy Services Independently

### Goal

Make each service buildable, versionable, and deployable without assuming the entire repo is started manually.

### Tasks

- keep service runtime configuration isolated
- make each service image runnable on its own
- ensure health checks, ports, and startup contracts are explicit
- reduce coupling to local `localhost` assumptions

## Priority 3: Externalize Config and Secrets

### Goal

Move from local development defaults toward environment-driven runtime configuration.

### Tasks

- separate local examples from deployment-time secrets
- prepare secret injection for JWT secrets and database credentials
- avoid hardcoded runtime assumptions in container environments
- document which settings are safe defaults vs deployment-managed values

## Priority 4: Add Observability

### Goal

Make service behavior easier to trace, debug, and operate.

### Tasks

- keep structured logs consistent across all services
- add metrics support
- add distributed tracing support such as OpenTelemetry
- ensure correlation IDs propagate across every HTTP hop

## Priority 5: Add Orchestration and Production Controls

### Goal

Move from local Docker Compose orchestration toward production-grade service lifecycle control.

### Tasks

- keep Docker Compose as the local baseline
- prepare for orchestration with Kubernetes, ECS, or an equivalent platform
- add readiness and liveness checks
- define restart policies, scaling rules, and resource limits
- add network and secret-management controls appropriate for deployment

## Recommended Execution Order

1. containerize every service and run the full stack with Docker Compose
2. make services independently deployable with explicit env contracts
3. harden configuration and secrets management
4. add observability primitives
5. add orchestration and production operational controls

## Current Status

- Priority 1 is now in progress.
- The initial implementation target is a full multi-container local runtime for the gateway and all six domain services.
