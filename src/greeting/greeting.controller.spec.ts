import { Test, TestingModule } from '@nestjs/testing';
import { GreetingController } from './greeting.controller';
import { GreetingService } from './greeting.service';
import { CreateGreetingDto } from './dto/create-greeting.dto';

const mockGreetingService = {
  create: jest.fn(),
  findAll: jest.fn(),
};

describe('GreetingController', () => {
  let controller: GreetingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GreetingController],
      providers: [{ provide: GreetingService, useValue: mockGreetingService }],
    }).compile();

    controller = module.get<GreetingController>(GreetingController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should call greetingService.create with the dto and return the result', async () => {
      const dto: CreateGreetingDto = {
        name: 'Keluarga Jaludin',
        message: 'Tahniah! Semoga bahagia selalu.',
        colorIndex: 3,
      };
      const expected = { _id: 'abc', ...dto, createdAt: new Date() };
      mockGreetingService.create.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(mockGreetingService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return the list from greetingService.findAll', async () => {
      const list = [
        { _id: '1', name: 'A', message: 'Hello!' },
        { _id: '2', name: 'B', message: 'Congrats!' },
      ];
      mockGreetingService.findAll.mockResolvedValue(list);

      const result = await controller.findAll();

      expect(mockGreetingService.findAll).toHaveBeenCalled();
      expect(result).toEqual(list);
    });

    it('should return empty array when no greetings exist', async () => {
      mockGreetingService.findAll.mockResolvedValue([]);
      const result = await controller.findAll();
      expect(result).toEqual([]);
    });
  });
});
