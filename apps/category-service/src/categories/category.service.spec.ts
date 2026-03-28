import { Test, TestingModule } from '@nestjs/testing';
import { CATEGORY_REPOSITORY } from './category.repository';
import { CategoryService } from './category.service';
import { InMemoryCategoryRepository } from './in-memory-category.repository';
import { CategoryStatus } from './enums/category-status.enum';

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        InMemoryCategoryRepository,
        {
          provide: CATEGORY_REPOSITORY,
          useExisting: InMemoryCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  it('creates a category', async () => {
    const response = await service.create({
      name: 'Computer Science',
      description: 'Books related to computing',
    });

    expect(response.success).toBe(true);
    expect(response.data.name).toBe('Computer Science');
    expect(response.data.status).toBe(CategoryStatus.ACTIVE);
  });

  it('rejects duplicate active category names', async () => {
    await service.create({
      name: 'History',
      description: 'History books',
    });

    await expect(
      service.create({
        name: 'history',
      }),
    ).rejects.toMatchObject({
      response: {
        error: {
          code: 'CATEGORY_NAME_ALREADY_EXISTS',
        },
      },
    });
  });

  it('deactivates a category and marks existence inactive', async () => {
    const created = await service.create({
      name: 'Literature',
    });

    const deleted = await service.remove(created.data.id);
    const existence = await service.existence(created.data.id);

    expect(deleted.success).toBe(true);
    expect(deleted.data.status).toBe(CategoryStatus.INACTIVE);
    expect(existence.data.exists).toBe(true);
    expect(existence.data.active).toBe(false);
  });
});
