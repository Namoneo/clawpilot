# ClawPilot 🦞

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/Angular-18+-DD0031.svg" alt="Angular">
  <img src="https://img.shields.io/badge/NestJS-10+-E0234E.svg" alt="NestJS">
</p>

AI Agent Management Platform - Install, run, and manage OpenClaw AI agents through a beautiful web dashboard.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core
- 🤖 **Agent Management** - Create, start, stop, and monitor AI agents
- 📋 **Templates** - Pre-configured agent templates
- 🎯 **Model Routing** - Configure planning, coding, review, chat, and RAG models
- 📊 **Analytics** - Track runs, tokens, and agent performance

### Security & Auth
- 🔒 **JWT Authentication** - Secure session management
- 🔐 **API Keys** - Programmatic access
- 👥 **Team Management** - Collaborate with team members
- ✅ **Roles & Permissions** - Granular access control

### Integrations
- 🔌 **External Integrations** - GitHub, Slack, Discord, Notion, Linear, Jira, GitLab
- 📄 **Documents (RAG)** - Upload documents for AI context
- 🌐 **Webhooks** - HTTP callbacks for events
- 📧 **Email Notifications** - Welcome, alerts, billing

### DevOps
- 🐳 **Docker** - Containerized deployment
- 📈 **Metrics** - System and agent metrics
- 🔔 **Alerts** - System monitoring and alerts
- 📝 **Audit Logs** - Track all user actions

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

### Installation

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
npm run migration:run
npm run start:dev
```

4. Start frontend:
```bash
cd frontend/angular-dashboard
npm install
npm start
```

5. Open http://localhost:4200

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/github` - GitHub OAuth login

### Agents
- `POST /api/agents` - Create agent
- `GET /api/agents` - List agents
- `GET /api/agents/:id` - Get agent
- `POST /api/agents/:id/start` - Start agent
- `POST /api/agents/:id/stop` - Stop agent
- `GET /api/agents/:id/logs` - Get agent logs
- `GET /api/agents/:id/runs` - Get run history

### Billing
- `GET /api/billing` - Get billing info
- `GET /api/billing/plans` - Get available plans
- `POST /api/billing/upgrade` - Upgrade plan

### Templates
- `GET /api/templates` - List templates
- `GET /api/templates/:id` - Get template

### Metrics
- `GET /api/metrics` - Get system metrics
- `GET /api/metrics/daily` - Get daily metrics
- `GET /api/analytics` - Get analytics

Full API docs available at `/api/docs` when running.

## Deployment

### Production

```bash
# Clone and setup
git clone https://github.com/Namoneo/clawpilot.git
cd clawpilot

# Setup environment
cp infra/production.env.example infra/production.env
# Edit production.env with your values

# Start production stack
cd infra/docker-compose
docker-compose -f docker-compose.yml up -d
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_USER` | PostgreSQL user | Yes |
| `DB_PASSWORD` | PostgreSQL password | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `OPENROUTER_API_KEY` | OpenRouter API key | No |
| `STRIPE_SECRET_KEY` | Stripe secret key | No |

## Configuration

### Agent Templates

```yaml
# Developer Assistant
routing:
  planning: openrouter/anthropic/claude-3.5-sonnet
  coding: ollama/deepseek-coder-v2:latest
  review: openrouter/anthropic/claude-3.5-sonnet
  chat: ollama/llama3.1:8b
  rag: ollama/qwen2.5:7b
```

### Model Providers

Supported providers:
- **OpenRouter** - Claude, GPT, Llama, and more
- **OpenAI** - GPT-4, GPT-4o
- **Anthropic** - Claude
- **Ollama** - Local models

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ using OpenClaw
