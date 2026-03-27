import { ExecutionContext, Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { RequestLoggingInterceptor } from './request-logging.interceptor';

describe('RequestLoggingInterceptor', () => {
  let interceptor: RequestLoggingInterceptor;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    interceptor = new RequestLoggingInterceptor();
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('logs successful requests with the correlation id', (done) => {
    const context = createExecutionContext();

    interceptor
      .intercept(context, {
        handle: () => of({ ok: true }),
      })
      .subscribe({
        complete: () => {
          const [payload] = logSpy.mock.calls[0] as [string];
          expect(logSpy).toHaveBeenCalled();
          expect(payload).toContain('"correlationId":"corr-123"');
          done();
        },
      });
  });

  it('logs error responses with the derived status code', (done) => {
    const context = createExecutionContext();

    interceptor
      .intercept(context, {
        handle: () => throwError(() => ({ status: 503 })),
      })
      .subscribe({
        error: () => {
          const [payload] = errorSpy.mock.calls[0] as [string];
          expect(errorSpy).toHaveBeenCalled();
          expect(payload).toContain('"statusCode":503');
          done();
        },
      });
  });
});

function createExecutionContext(): ExecutionContext {
  const request = {
    method: 'GET',
    url: '/health',
    originalUrl: '/health',
    correlationId: 'corr-123',
    requestStartedAt: Date.now() - 10,
  };

  const response = {
    statusCode: 200,
  };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as ExecutionContext;
}
