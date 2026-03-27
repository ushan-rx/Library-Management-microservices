import { DownstreamAuthContextService } from './downstream-auth-context.service';
import { RequestWithContext } from '../request-context/request-context.types';

describe('DownstreamAuthContextService', () => {
  let service: DownstreamAuthContextService;

  beforeEach(() => {
    service = new DownstreamAuthContextService();
  });

  it('attaches trusted downstream auth headers and request context', () => {
    const request = {
      correlationId: 'corr-123',
    } as RequestWithContext;

    service.attachUserContext(request, {
      sub: 'user-123',
      username: 'admin01',
      email: 'admin@example.com',
      role: 'ADMIN',
    });

    expect(request.authenticatedUser).toEqual({
      id: 'user-123',
      role: 'ADMIN',
      username: 'admin01',
      email: 'admin@example.com',
    });
    expect(request.forwardHeaders).toEqual({
      'x-user-id': 'user-123',
      'x-user-role': 'ADMIN',
      'x-username': 'admin01',
      'x-correlation-id': 'corr-123',
    });
  });
});
