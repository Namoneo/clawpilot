import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../app.module';
import * as request from 'supertest';

describe('Agents (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let testAgentId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    // Register and login to get token
    const email = `agentstest${Date.now()}@example.com`;
    const registerRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email,
        password: 'password123',
        name: 'Agents Test',
      });

    authToken = registerRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/agents (POST)', () => {
    it('should create a new agent', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/agents')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Agent',
          templateId: 'developer-assistant',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Agent');
      testAgentId = response.body.id;
    });
  });

  describe('/api/agents (GET)', () => {
    it('should return all agents for user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/agents')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('/api/agents/:id (GET)', () => {
    it('should return a specific agent', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/agents/${testAgentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(testAgentId);
      expect(response.body.name).toBe('Test Agent');
    });
  });

  describe('/api/agents/:id/start (POST)', () => {
    it('should start an agent', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/agents/${testAgentId}/start`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body.agent.status).toBe('running');
      expect(response.body).toHaveProperty('runId');
    });
  });

  describe('/api/agents/:id/stop (POST)', () => {
    it('should stop an agent', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/agents/${testAgentId}/stop`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body.status).toBe('stopped');
    });
  });

  describe('/api/agents/:id/logs (GET)', () => {
    it('should return agent logs', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/agents/${testAgentId}/logs`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
