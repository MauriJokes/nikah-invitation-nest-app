import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GreetingService } from './greeting.service';
import { Greeting, GreetingDocument } from './schemas/greeting.schema';
import { CreateGreetingDto } from './dto/create-greeting.dto';

const mockGreeting = (override: Partial<GreetingDocument> = {}): any => ({
  _id: 'greeting-id' as any,
  name: 'Keluarga Jaludin',
  message: 'Tahniah! Semoga bahagia selalu.',
  colorIndex: 3,
  createdAt: new Date('2026-12-01') as any,
  ...override,
});

describe('GreetingService', () => {
  let service: GreetingService;
  let model: Model<GreetingDocument>;

  const mockModel = {
    create: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GreetingService,
        { provide: getModelToken(Greeting.name), useValue: mockModel },
      ],
    }).compile();

    service = module.get<GreetingService>(GreetingService);
    model = module.get<Model<GreetingDocument>>(getModelToken(Greeting.name));
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should create and return a greeting', async () => {
      const dto: CreateGreetingDto = {
        name: 'Keluarga Jaludin',
        message: 'Tahniah! Semoga bahagia selalu.',
        colorIndex: 3,
      };
      const expected = mockGreeting();
      mockModel.create.mockResolvedValue(expected);

      const result = await service.create(dto);

      expect(mockModel.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return all greetings sorted newest first', async () => {
      const greetings = [mockGreeting(), mockGreeting({ name: 'Other' })];
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(greetings),
          }),
        }),
      });

      const result = await service.findAll();

      expect(mockModel.find).toHaveBeenCalled();
      expect(result).toEqual(greetings);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no greetings exist', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });
});
