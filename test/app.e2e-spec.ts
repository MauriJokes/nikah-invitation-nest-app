import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AppModule } from './../src/app.module';

describe('Wedding Invitation API (e2e)', () => {
  let app: INestApplication<App>;
  let mongod: MongoMemoryReplSet;

  beforeAll(async () => {
    mongod = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    process.env.MONGODB_URI = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    // Ensure collections exist before any transactional tests run
    const conn = moduleFixture.get<Connection>(getConnectionToken());
    await Promise.all([
      conn.model('Rsvp').createCollection().catch(() => {}),
      conn.model('Greeting').createCollection().catch(() => {}),
    ]);
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  // ── RSVP ──────────────────────────────────────────────────────────────────
  describe('POST /api/rsvp', () => {
    it('creates a new RSVP and returns 201 with the document', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/rsvp')
        .send({
          name: 'Siti Aminah',
          guests: 2,
          attendance: 'yes',
          message: 'Looking forward to it!',
          colorIndex: 2,
        })
        .expect(201);

      expect(res.body).toMatchObject({
        name: 'Siti Aminah',
        guests: 2,
        attendance: 'yes',
      });
      expect(res.body.greetingId).toBeDefined();
      expect(res.body._id).toBeDefined();
      expect(res.body.createdAt).toBeDefined();
    });

    it('creates an RSVP without optional message', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/rsvp')
        .send({
          name: 'Ahmad',
          guests: 1,
          attendance: 'no',
        })
        .expect(201);

      expect(res.body.name).toBe('Ahmad');
      expect(res.body.attendance).toBe('no');
    });

    it('returns 400 when name is missing', () => {
      return request(app.getHttpServer())
        .post('/api/rsvp')
        .send({ guests: 2, attendance: 'yes' })
        .expect(400);
    });

    it('returns 400 when attendanceStatus is invalid', () => {
      return request(app.getHttpServer())
        .post('/api/rsvp')
        .send({ name: 'Test', guests: 1, attendance: 'maybe' })
        .expect(400);
    });

    it('returns 400 when numberOfGuests is 0', () => {
      return request(app.getHttpServer())
        .post('/api/rsvp')
        .send({ name: 'Test', guests: 0, attendance: 'yes' })
        .expect(400);
    });
  });

  describe('GET /api/rsvp', () => {
    it('returns all RSVPs as an array', async () => {
      const res = await request(app.getHttpServer()).get('/api/rsvp').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('returns RSVPs sorted newest first', async () => {
      const res = await request(app.getHttpServer()).get('/api/rsvp').expect(200);
      const dates = res.body.map((r: any) => new Date(r.createdAt).getTime());
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
      }
    });
  });

  // ── Greetings ─────────────────────────────────────────────────────────────
  describe('POST /api/greetings', () => {
    it('creates a greeting and returns 201 with the document', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/greetings')
        .send({ name: 'Keluarga Jaludin', message: 'Tahniah! Semoga bahagia.', colorIndex: 1 })
        .expect(201);

      expect(res.body).toMatchObject({
        name: 'Keluarga Jaludin',
        message: 'Tahniah! Semoga bahagia.',
        colorIndex: 1,
      });
      expect(res.body._id).toBeDefined();
      expect(res.body.createdAt).toBeDefined();
    });

    it('returns 400 when name is missing', () => {
      return request(app.getHttpServer())
        .post('/api/greetings')
        .send({ message: 'Hello!' })
        .expect(400);
    });

    it('returns 400 when message is missing', () => {
      return request(app.getHttpServer())
        .post('/api/greetings')
        .send({ name: 'Someone' })
        .expect(400);
    });

    it('returns 400 when both fields are empty strings', () => {
      return request(app.getHttpServer())
        .post('/api/greetings')
        .send({ name: '', message: '' })
        .expect(400);
    });
  });

  describe('GET /api/greetings', () => {
    it('returns all greetings as an array', async () => {
      const res = await request(app.getHttpServer()).get('/api/greetings').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('returns greetings sorted newest first', async () => {
      // Add two more to guarantee ordering
      await request(app.getHttpServer())
        .post('/api/greetings')
        .send({ name: 'First', message: 'First message', colorIndex: 1 });
      await request(app.getHttpServer())
        .post('/api/greetings')
        .send({ name: 'Second', message: 'Second message', colorIndex: 2 });

      const res = await request(app.getHttpServer()).get('/api/greetings').expect(200);
      const dates = res.body.map((g: any) => new Date(g.createdAt).getTime());
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
      }
    });
  });
});

