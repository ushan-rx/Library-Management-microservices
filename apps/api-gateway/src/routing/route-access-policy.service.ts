import { Injectable } from '@nestjs/common';
import { ServiceRegistryService } from '../config/service-registry.service';

@Injectable()
export class RouteAccessPolicyService {
  constructor(private readonly serviceRegistry: ServiceRegistryService) {}

  isPublicRoute(method: string, path: string): boolean {
    const normalizedMethod = method.toUpperCase();
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    if (normalizedMethod === 'GET' && normalizedPath === '/health') {
      return true;
    }

    if (
      normalizedMethod === 'POST' &&
      ['/auth/register', '/auth/login'].includes(normalizedPath)
    ) {
      return true;
    }

    return false;
  }

  isProtectedRoute(method: string, path: string): boolean {
    if (this.isPublicRoute(method, path)) {
      return false;
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return this.serviceRegistry
      .getProtectedRoutePrefixes()
      .some(
        (protectedPrefix) =>
          normalizedPath === protectedPrefix ||
          normalizedPath.startsWith(`${protectedPrefix}/`),
      );
  }

  getPolicySummary(): { publicRoutes: string[]; protectedPrefixes: string[] } {
    return {
      publicRoutes: this.serviceRegistry.getPublicRoutePrefixes(),
      protectedPrefixes: this.serviceRegistry.getProtectedRoutePrefixes(),
    };
  }
}
