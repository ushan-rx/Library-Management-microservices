import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let passwordService: PasswordService;

  beforeEach(() => {
    passwordService = new PasswordService();
  });

  it('hashes passwords securely and verifies them correctly', async () => {
    const password = 'StrongPassword123';
    const hash = await passwordService.hash(password);

    expect(hash).not.toBe(password);
    await expect(passwordService.compare(password, hash)).resolves.toBe(true);
    await expect(
      passwordService.compare('WrongPassword123', hash),
    ).resolves.toBe(false);
  });
});
