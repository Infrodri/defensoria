import { Test, TestingModule } from '@nestjs/testing';
import { PersonsService } from '../persons.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('PersonsService', () => {
  let service: PersonsService;
  let prisma: { person: { findMany: any; create: any; findUnique: any } };

  beforeEach(async () => {
    prisma = {
      person: {
        findMany: vi.fn(),
        create: vi.fn(),
        findUnique: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<PersonsService>(PersonsService);
  });

  it('should return empty array if query is empty or less than 2 characters', async () => {
    expect(await service.search('')).toEqual([]);
    expect(await service.search('a')).toEqual([]);
    expect(prisma.person.findMany).not.toHaveBeenCalled();
  });

  it('should search person table by documentNumber, firstName, or lastName for query >= 2 chars', async () => {
    const mockPersons = [
      { id: '1', firstName: 'Juan', lastName: 'Perez', documentNumber: '123456' },
    ];
    prisma.person.findMany.mockResolvedValue(mockPersons);

    const results = await service.search('Juan');
    expect(results).toEqual(mockPersons);
    expect(prisma.person.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            { documentNumber: { contains: 'Juan', mode: 'insensitive' } },
            { firstName: { contains: 'Juan', mode: 'insensitive' } },
            { lastName: { contains: 'Juan', mode: 'insensitive' } },
          ]),
        }),
      }),
    );
  });
});
