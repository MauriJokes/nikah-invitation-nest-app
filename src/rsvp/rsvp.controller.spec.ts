import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { RsvpController } from './rsvp.controller';
import { RsvpService } from './rsvp.service';
import { CreateRsvpDto } from './dto/create-rsvp.dto';

const mockRsvpService = {
  create: jest.fn(),
  findAll: jest.fn(),
};

describe('RsvpController', () => {
  let controller: RsvpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 5 }])],
      controllers: [RsvpController],
      providers: [{ provide: RsvpService, useValue: mockRsvpService }],
    }).compile();

    controller = module.get<RsvpController>(RsvpController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should call rsvpService.create with the dto and return the result', async () => {
      const dto: CreateRsvpDto = {
        name: 'Siti Aminah',
        guests: 2,
        attendance: 'yes',
        message: "Can't wait!",
      };
      const expected = { _id: 'abc', ...dto, createdAt: new Date() };
      mockRsvpService.create.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(mockRsvpService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });

    it('should call rsvpService.create with anonymous dto and return the result', async () => {
      const dto: CreateRsvpDto = {
        name: 'Ahmad',
        guests: 1,
        attendance: 'yes',
        message: 'Congratulations!',
        isAnonymous: true,
      };
      const expected = { _id: 'xyz', ...dto, createdAt: new Date() };
      mockRsvpService.create.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(mockRsvpService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return the list from rsvpService.findAll', async () => {
      const list = [
        { _id: '1', name: 'A', guests: 1, attendance: 'yes' },
        { _id: '2', name: 'B', guests: 3, attendance: 'no' },
      ];
      mockRsvpService.findAll.mockResolvedValue(list);

      const result = await controller.findAll();

      expect(mockRsvpService.findAll).toHaveBeenCalled();
      expect(result).toEqual(list);
    });

    it('should return empty array when no RSVPs exist', async () => {
      mockRsvpService.findAll.mockResolvedValue([]);
      const result = await controller.findAll();
      expect(result).toEqual([]);
    });
  });
});
