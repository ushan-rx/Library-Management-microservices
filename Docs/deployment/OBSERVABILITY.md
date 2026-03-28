# Observability

## Purpose

This document describes the current observability baseline for the library system services and API Gateway.

## Current Observability Features

- structured request logging in the API Gateway
- correlation ID propagation across gateway and downstream HTTP calls
- structured downstream call logs in Book Service and Borrow Service integrations
- Prometheus-style `/metrics` endpoints on the gateway and every backend service

## Metrics Endpoints

The following metrics endpoints are now available:

- Gateway: `GET /metrics`
- Auth Service: `GET /metrics`
- Member Service: `GET /metrics`
- Category Service: `GET /metrics`
- Book Service: `GET /metrics`
- Borrow Service: `GET /metrics`
- Fine Payment Service: `GET /metrics`

These endpoints return text in a Prometheus-compatible exposition style.

## Current Metrics

The current in-memory metrics surface includes:

- service info gauge
- process uptime gauge
- total completed HTTP requests by method, route, and status code
- summed HTTP request durations in milliseconds by method, route, and status code

## Notes

- Metrics are process-local and reset when a service restarts.
- This is an initial observability step, not yet a full Prometheus or OpenTelemetry stack.
- The next observability evolution should be a real metrics scraper/export path plus trace instrumentation.
