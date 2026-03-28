# API Gateway Changelog

## 2026-03-27T18:30:00+05:30

- Scope: api-gateway
- Type: chore
- Summary: Initialized Phase 0 changelog and corrected baseline monorepo scaffold references for gateway bootstrap and workspace scripts.
- Files: package.json, nest-cli.json, apps/api-gateway/src/main.ts, apps/api-gateway/test/app.e2e-spec.ts
- Impact: Gateway scaffold now participates correctly in workspace build, lint, and test checks.
- Notes: No API contract deviation.

## 2026-03-27T19:00:00+05:30

- Scope: api-gateway
- Type: chore
- Summary: Established the Phase 1 shared foundation with Dockerized PostgreSQL, shared environment variables, gateway base config entries, and request-correlation documentation.
- Files: package.json, package-lock.json, .env.example, docker-compose.yml, docs/shared/PHASE_1_DEVELOPMENT_FOUNDATION.md, README.md
- Impact: Gateway and downstream services now have a documented startup contract and a reusable resource layer for future implementation phases.
- Notes: No API contract deviation.

## 2026-03-27T19:25:00+05:30

- Scope: api-gateway
- Type: feature
- Summary: Implemented the Phase 2 gateway skeleton with a `/health` endpoint, typed service registry, route access policy, correlation ID middleware, request logging, and normalized error handling.
- Files: apps/api-gateway/src/api-gateway.module.ts, apps/api-gateway/src/main.ts, apps/api-gateway/src/bootstrap.ts, apps/api-gateway/src/config/gateway.config.ts, apps/api-gateway/src/config/service-registry.service.ts, apps/api-gateway/src/routing/route-access-policy.service.ts, apps/api-gateway/src/health/health.controller.ts, apps/api-gateway/src/services/api-gateway.service.ts, apps/api-gateway/src/platform/request-context/correlation-id.middleware.ts, apps/api-gateway/src/platform/logging/request-logging.interceptor.ts, apps/api-gateway/src/platform/errors/gateway-exception.filter.ts, apps/api-gateway/test/app.e2e-spec.ts, README.md
- Impact: The gateway can now boot as a real entry-point skeleton and be checked locally through health, correlation ID propagation, and error normalization behavior.
- Notes: No API contract deviation.

## 2026-03-28T11:15:00+05:30

- Scope: api-gateway
- Type: feature
- Summary: Enabled Swagger documentation for the gateway health endpoint and added documentation smoke coverage for `/docs` and `/docs-json`.
- Files: apps/shared/configure-swagger.ts, apps/api-gateway/src/bootstrap.ts, apps/api-gateway/src/health/health.controller.ts, apps/api-gateway/test/app.e2e-spec.ts, README.md, package.json, package-lock.json
- Impact: The gateway now exposes a usable OpenAPI entry point that can be checked locally during development and demos.
- Notes: No API contract deviation.

## 2026-03-28T15:05:00+05:30

- Scope: api-gateway
- Type: feat
- Summary: Implemented full gateway route forwarding with JWT verification, trusted user-header propagation, and upstream failure translation for all service route groups.
- Files: apps/api-gateway/src/api-gateway.module.ts, apps/api-gateway/src/config/service-registry.service.ts, apps/api-gateway/src/platform/auth/gateway-auth.service.ts, apps/api-gateway/src/routing/gateway-proxy.controller.ts, apps/api-gateway/src/routing/gateway-proxy.service.ts, apps/api-gateway/src/config/service-registry.service.spec.ts, apps/api-gateway/test/app.e2e-spec.ts, README.md
- Impact: The gateway is now a real public entry point that can forward requests to all downstream services while enforcing auth and preserving request context.
- Notes: Downstream 4xx/5xx JSON responses are forwarded through as returned by the service, while unreachable or timed-out upstreams are translated by the gateway.

## 2026-03-28T18:25:00+05:30

- Scope: api-gateway
- Type: feature
- Summary: Implemented downstream route forwarding and gateway-based end-to-end business flow coverage across auth, categories, books, members, borrows, and fines.
- Files: apps/api-gateway/src/api-gateway.module.ts, apps/api-gateway/src/config/service-registry.service.ts, apps/api-gateway/src/config/service-registry.service.spec.ts, apps/api-gateway/src/platform/auth/gateway-auth.service.ts, apps/api-gateway/src/platform/auth/gateway-jwt-payload.interface.ts, apps/api-gateway/src/platform/request-context/request-context.types.ts, apps/api-gateway/src/routing/gateway-proxy.controller.ts, apps/api-gateway/src/routing/gateway-proxy.service.ts, apps/api-gateway/test/gateway-business-flows.e2e-spec.ts, README.md
- Impact: The gateway now acts as the real system entry point for critical business flows, and the full librarian workflow is regression-tested through actual service-to-service interactions.
- Notes: No API contract deviation.

## 2026-03-28T19:20:00+05:30

- Scope: api-gateway
- Type: refactor
- Summary: Improved gateway observability by logging actor context and downstream route targets for both successful and failed requests.
- Files: apps/api-gateway/src/platform/request-context/request-context.types.ts, apps/api-gateway/src/platform/logging/request-logging.interceptor.ts, apps/api-gateway/src/platform/logging/request-logging.interceptor.spec.ts, apps/api-gateway/src/routing/gateway-proxy.service.ts, README.md
- Impact: Gateway logs are more useful during debugging because they now show who made the request and which downstream service group handled it.
- Notes: No API contract deviation.

## 2026-03-28T19:25:00+05:30

- Scope: api-gateway
- Type: docs
- Summary: Finalized release-candidate documentation by aligning README setup guidance, refreshing the repository structure reference, and recording the final verification summary.
- Files: README.md, PROJECT_STRUCTURE.md, docs/agents/PHASE_14_RELEASE_CANDIDATE.md
- Impact: The repository handoff docs now match the implemented system and the final verification state.
- Notes: No API contract deviation.

## 2026-03-28T20:40:00+05:30

- Scope: api-gateway
- Type: chore
- Summary: Added container-ready full-stack Docker Compose support and wired the gateway for service-name based runtime routing inside the container network.
- Files: docker-compose.yml, docker/node-service.Dockerfile, package.json, README.md, docs/agents/MICROSERVICES_EVOLUTION_PLAN.md
- Impact: The gateway can now participate in a multi-container local runtime instead of depending only on manually started local processes.
- Notes: No API contract deviation.
