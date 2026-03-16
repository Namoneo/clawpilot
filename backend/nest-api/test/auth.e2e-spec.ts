import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/auth/register (POST)', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: `test${Date.now()}@example.com`,
          password: 'password123',
          name: 'Test User',
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
    });

    it('should reject duplicate email', async () => {
      const email = `duplicate${Date.now()}@example.com`;
      
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email,
          password: 'password123',
          name: 'Test User',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email,
          password: 'password123',
          name: 'Test User',
        })
        .expect(409);
    });
  });

  describe('/api/auth/login (POST)', () => {
    it('should login with valid credentials', async () => {
      const email = `logintest${Date.now()}@example.com`;
      
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email,
          password: 'password123',
          name: 'Login Test',
        });

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email,
          password: 'password123',
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
    });

    it('should reject invalid password', async () => {
      const email = `invalidpass${Date.now()}@example.com`;
      
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email,
          password: 'correctpassword',
          name: 'Test',
        });

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email,
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });
});
