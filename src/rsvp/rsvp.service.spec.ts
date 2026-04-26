import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RsvpService } from './rsvp.service';
import { Rsvp, RsvpDocument } from './schemas/rsvp.schema';
import { Greeting } from '../greeting/schemas/greeting.schema';
import { CreateRsvpDto } from './dto/create-rsvp.dto';

const mockRsvp = (override: Partial<RsvpDocument> = {}): any => ({
  _id: 'some-id' as any,
  name: 'Siti Aminah',
  guests: 2,
  attendance: 'yes',
  createdAt: new Date('2026-12-01') as any,
  ...override,
});

describe('RsvpService', () => {
  let service: RsvpService;

  const mockSession = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  };

  const mockRsvpModel = {
    create: jest.fn(),
    find: jest.fn(),
    db: {
      startSession: jest.fn().mockResolvedValue(mockSession),
    },
  };

  const mockGreetingModel = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RsvpService,
        { provide: getModelToken(Rsvp.name), useValue: mockRsvpModel },
        { provide: getModelToken(Greeting.name), useValue: mockGreetingModel },
      ],
    }).compile();

    service = module.get<RsvpService>(RsvpService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should run a transaction, write to greetings and return the RSVP when message is present', async () => {
      const dto: CreateRsvpDto = {
        name: 'Siti Aminah',
        guests: 2,
        attendance: 'yes',
        message: 'Looking forward to it!',
        colorIndex: 2,
      };
      const createdRsvp = mockRsvp();
      mockRsvpModel.create.mockResolvedValue([createdRsvp]);
      mockGreetingModel.create.mockResolvedValue([{ _id: 'greeting-id' }]);

      const result = await service.create(dto);

      expect(mockRsvpModel.db.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(mockGreetingModel.create).toHaveBeenCalledWith(
        [
          {
            name: dto.name,
            message: dto.message,
            isAnonymous: dto.isAnonymous,
            colorIndex: dto.colorIndex,
          },
        ],
        { session: mockSession },
      );
      expect(mockRsvpModel.create).toHaveBeenCalledWith(
        [
          {
            name: dto.name,
            guests: dto.guests,
            attendance: dto.attendance,
            colorIndex: dto.colorIndex,
            greetingId: 'greeting-id',
          },
        ],
        { session: mockSession },
      );
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(result).toEqual(createdRsvp);
    });

    it('should abort the transaction and rethrow if an error occurs', async () => {
      const dto: CreateRsvpDto = {
        name: 'Siti Aminah',
        guests: 2,
        attendance: 'yes',
        message: 'Looking forward to it!',
      };
      mockGreetingModel.create.mockRejectedValue(new Error('DB error'));

      await expect(service.create(dto)).rejects.toThrow('DB error');

      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(mockSession.commitTransaction).not.toHaveBeenCalled();
    });

    it('should create an RSVP without a transaction when message is absent', async () => {
      const dto: CreateRsvpDto = {
        name: 'Ahmad',
        guests: 1,
        attendance: 'no',
      };
      const expected = mockRsvp({
        name: 'Ahmad',
        guests: 1,
        attendance: 'no',
      });
      mockRsvpModel.create.mockResolvedValue(expected);

      const result = await service.create(dto);

      expect(mockRsvpModel.db.startSession).not.toHaveBeenCalled();
      expect(mockGreetingModel.create).not.toHaveBeenCalled();
      expect(mockRsvpModel.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });

    it('should run a transaction and write greeting with isAnonymous when isAnonymous is true and message is present', async () => {
      const dto: CreateRsvpDto = {
        name: 'Ahmad',
        guests: 1,
        attendance: 'yes',
        message: 'Congratulations!',
        isAnonymous: true,
        colorIndex: 1,
      };
      const expected = mockRsvp({
        name: 'Ahmad',
        guests: 1,
        attendance: 'yes',
        greetingId: 'greeting-id',
      });
      mockRsvpModel.create.mockResolvedValue([expected]);
      mockGreetingModel.create.mockResolvedValue([{ _id: 'greeting-id' }]);

      const result = await service.create(dto);

      expect(mockRsvpModel.db.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(mockGreetingModel.create).toHaveBeenCalledWith(
        [
          {
            name: dto.name,
            message: dto.message,
            isAnonymous: dto.isAnonymous,
            colorIndex: dto.colorIndex,
          },
        ],
        { session: mockSession },
      );
      expect(mockRsvpModel.create).toHaveBeenCalledWith(
        [
          {
            name: dto.name,
            guests: dto.guests,
            attendance: dto.attendance,
            colorIndex: dto.colorIndex,
            greetingId: 'greeting-id',
          },
        ],
        { session: mockSession },
      );
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return all RSVPs sorted newest first', async () => {
      const rsvps = [mockRsvp(), mockRsvp({ name: 'Other' })];
      mockRsvpModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(rsvps),
        }),
      });

      const result = await service.findAll();

      expect(mockRsvpModel.find).toHaveBeenCalledWith();
      expect(result).toEqual(rsvps);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no RSVPs exist', async () => {
      mockRsvpModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.findAll();

      expect(mockRsvpModel.find).toHaveBeenCalledWith();
      expect(result).toEqual([]);
    });
  });
});
