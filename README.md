# ClawPilot 🦞

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/Angular-18+-DD0031.svg" alt="Angular">
  <img src="https://img.shields.io/badge/NestJS-10+-E0234E.svg" alt="NestJS">
</p>

AI Agent Management Platform - Install, run, and manage OpenClaw AI agents through a beautiful web dashboard.

## Problem Statement

- OpenClaw setup is difficult
- Model routing configuration is confusing  
- Developers want an easy dashboard
- Monitoring and logs are hard to track
- Agent templates are missing

## Solution

ClawPilot solves all these problems by providing a unified platform to manage AI agents.

## Features

- 🤖 **Agent Management** - Create, start, stop, and monitor AI agents
- 📋 **Templates** - Pre-configured agent templates (Developer Assistant, Research Agent, Automation Agent)
- 🎯 **Model Routing** - Configure planning, coding, review, chat, and RAG models
- 📊 **Monitoring** - Track runs, tokens, and agent status
- 🔒 **Authentication** - JWT-based auth with secure sessions
- 💳 **Billing** - Stripe integration with Free/Pro/Team plans
- 👥 **Teams** - Collaborate with team members
- 🔌 **Integrations** - GitHub, Slack, Discord, Notion, Linear, Jira, GitLab

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Angular   │────▶│  NestJS API │────▶│  PostgreSQL │
│  Dashboard  │     │   (Backend) │     │   Database  │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          ▼
                   ┌─────────────┐     ┌─────────────┐
                   │  FastAPI    │────▶│    Redis    │
                   │  Orchestrator│     │    Queue    │
                   └─────────────┘     └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │   Worker    │
                   │ (Docker)    │
                   └─────────────┘
```

## Tech Stack

- **Frontend**: Angular 18, Standalone Components, Signals, TailwindCSS
- **Backend**: NestJS (TypeScript)
- **AI Orchestration**: Python FastAPI, LangGraph
- **Workers**: Docker containers
- **Database**: PostgreSQL
- **Queue**: Redis
- **Deployment**: Docker Compose

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/Namoneo/clawpilot.git
cd clawpilot
```

2. Start infrastructure:
```bash
cd infra/docker-compose
docker-compose up -d
```

3. Start backend:
```bash
cd backend/nest-api
npm install
npm run start:dev
```

4. Start frontend:
```bash
cd frontend/angular-dashboard
npm install
npm start
```

5. Open http://localhost:4200

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Agents
- `POST /api/agents` - Create agent
- `GET /api/agents` - List agents
- `GET /api/agents/:id` - Get agent
- `POST /api/agents/:id/start` - Start agent
- `POST /api/agents/:id/stop` - Stop agent
- `GET /api/agents/:id/logs` - Get agent logs
- `GET /api/agents/:id/runs` - Get run history

## Agent Templates

### Developer Assistant
```yaml
routing:
  planning: openrouter/anthropic/claude-3.5-sonnet
  coding: ollama/deepseek-coder-v2:latest
  review: openrouter/anthropic/claude-3.5-sonnet
  chat: ollama/llama3.1:8b
  rag: ollama/qwen2.5:7b
```

### Research Agent
```yaml
routing:
  planning: openrouter/anthropic/claude-3.5-sonnet
  coding: ollama/qwen2.5:7b
  review: openrouter/anthropic/claude-3.5-sonnet
  chat: ollama/llama3.1:8b
  rag: ollama/qwen2.5:7b
```

### Automation Agent
```yaml
routing:
  planning: openrouter/anthropic/claude-3.5-sonnet
  coding: ollama/deepseek-coder-v2:latest
  review: ollama/llama3.1:8b
  chat: ollama/llama3.1:8b
  rag: ollama/qwen2.5:7b
```

## Pricing

| Feature | Free | Pro | Team |
|---------|------|-----|------|
| Agents | 1 | 5 | 20 |
| Templates | 3 | All | All |
| Monitoring | Basic | Advanced | Advanced |
| Team Access | ❌ | ❌ | ✅ |
| Private Templates | ❌ | ❌ | ✅ |
| Price | $0 | $29/mo | $99/mo |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE for details.

---

Built with ❤️ using OpenClaw
