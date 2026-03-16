import { Test, TestingModule } from '@nestjs/testing';
import { AgentsService } from '../agents.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Agent } from '../entities/agent.entity';
import { AgentRun } from '../entities/agent-run.entity';
import { NotFoundException } from '@nestjs/common';

describe('AgentsService', () => {
  let service: AgentsService;
  let mockAgentRepository: any;
  let mockRunRepository: any;

  beforeEach(async () => {
    mockAgentRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    mockRunRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentsService,
        {
          provide: getRepositoryToken(Agent),
          useValue: mockAgentRepository,
        },
        {
          provide: getRepositoryToken(AgentRun),
          useValue: mockRunRepository,
        },
      ],
    }).compile();

    service = module.get<AgentsService>(AgentsService);
  });

  describe('create', () => {
    it('should create a new agent', async () => {
      mockAgentRepository.create.mockReturnValue({ userId: 1, name: 'Test Agent', status: 'stopped' });
      mockAgentRepository.save.mockResolvedValue({ id: 1, userId: 1, name: 'Test Agent', status: 'stopped' });

      const result = await service.create(1, { name: 'Test Agent', templateId: 'developer' });

      expect(result.name).toBe('Test Agent');
      expect(result.status).toBe('stopped');
    });
  });

  describe('findAll', () => {
    it('should return array of agents', async () => {
      const agents = [
        { id: 1, name: 'Agent 1', userId: 1 },
        { id: 2, name: 'Agent 2', userId: 1 },
      ];
      mockAgentRepository.find.mockResolvedValue(agents);

      const result = await service.findAll(1);

      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should return an agent by id', async () => {
      const agent = { id: 1, name: 'Test Agent', userId: 1 };
      mockAgentRepository.findOne.mockResolvedValue(agent);

      const result = await service.findOne(1, 1);

      expect(result.name).toBe('Test Agent');
    });

    it('should throw NotFoundException if agent not found', async () => {
      mockAgentRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('start', () => {
    it('should start an agent and create a run', async () => {
      const agent = { id: 1, name: 'Test Agent', userId: 1, status: 'stopped' };
      mockAgentRepository.findOne.mockResolvedValue(agent);
      mockAgentRepository.save.mockResolvedValue({ ...agent, status: 'running' });
      mockRunRepository.create.mockReturnValue({ agentId: 1, status: 'running' });
      mockRunRepository.save.mockResolvedValue({ id: 1, agentId: 1, status: 'running' });

      const result = await service.start(1, 1);

      expect(result.agent.status).toBe('running');
      expect(result.runId).toBeDefined();
    });
  });

  describe('stop', () => {
    it('should stop an agent', async () => {
      const agent = { id: 1, name: 'Test Agent', userId: 1, status: 'running' };
      mockAgentRepository.findOne.mockResolvedValue(agent);
      mockAgentRepository.save.mockResolvedValue({ ...agent, status: 'stopped' });

      const result = await service.stop(1, 1);

      expect(result.status).toBe('stopped');
    });
  });

  describe('getLogs', () => {
    it('should return agent logs', async () => {
      const agent = { id: 1, name: 'Test Agent', userId: 1 };
      const runs = [
        { id: 1, agentId: 1, status: 'completed', startedAt: new Date() },
      ];
      mockAgentRepository.findOne.mockResolvedValue(agent);
      mockRunRepository.find.mockResolvedValue(runs);

      const result = await service.getLogs(1, 1);

      expect(result).toHaveLength(1);
    });
  });
});
