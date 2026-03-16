import { Injectable } from '@nestjs/common';

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  routing: {
    planning: string;
    coding: string;
    review: string;
    chat: string;
    rag?: string;
  };
  features: string[];
}

@Injectable()
export class TemplatesService {
  private templates: AgentTemplate[] = [
    {
      id: 'developer-assistant',
      name: 'Developer Assistant',
      description: 'AI coding assistant for software development with planning, coding, and review capabilities.',
      routing: {
        planning: 'openrouter/anthropic/claude-3.5-sonnet',
        coding: 'ollama/deepseek-coder-v2:latest',
        review: 'openrouter/anthropic/claude-3.5-sonnet',
        chat: 'ollama/llama3.1:8b',
        rag: 'ollama/qwen2.5:7b',
      },
      features: ['Code Generation', 'Bug Fixing', 'Code Review', 'Unit Tests'],
    },
    {
      id: 'research-agent',
      name: 'Research Agent',
      description: 'AI agent for research, documentation gathering, and knowledge synthesis.',
      routing: {
        planning: 'openrouter/anthropic/claude-3.5-sonnet',
        coding: 'ollama/qwen2.5:7b',
        review: 'openrouter/anthropic/claude-3.5-sonnet',
        chat: 'ollama/llama3.1:8b',
        rag: 'ollama/qwen2.5:7b',
      },
      features: ['Web Research', 'Documentation', 'Summarization', 'RAG'],
    },
    {
      id: 'automation-agent',
      name: 'Automation Agent',
      description: 'AI agent for task automation, workflows, and process execution.',
      routing: {
        planning: 'openrouter/anthropic/claude-3.5-sonnet',
        coding: 'ollama/deepseek-coder-v2:latest',
        review: 'ollama/llama3.1:8b',
        chat: 'ollama/llama3.1:8b',
        rag: 'ollama/qwen2.5:7b',
      },
      features: ['Task Automation', 'Workflows', 'Scheduling', 'Integrations'],
    },
    {
      id: 'data-analyst',
      name: 'Data Analyst',
      description: 'AI agent for data analysis, visualization, and business intelligence.',
      routing: {
        planning: 'openrouter/anthropic/claude-3.5-sonnet',
        coding: 'ollama/qwen2.5:7b',
        review: 'openrouter/anthropic/claude-3.5-sonnet',
        chat: 'ollama/llama3.1:8b',
        rag: 'ollama/qwen2.5:7b',
      },
      features: ['Data Analysis', 'Visualization', 'SQL Queries', 'Reports'],
    },
    {
      id: 'security-auditor',
      name: 'Security Auditor',
      description: 'AI agent for security analysis, vulnerability scanning, and compliance.',
      routing: {
        planning: 'openrouter/anthropic/claude-3.5-sonnet',
        coding: 'ollama/deepseek-coder-v2:latest',
        review: 'openrouter/anthropic/claude-3.5-sonnet',
        chat: 'ollama/llama3.1:8b',
        rag: 'ollama/qwen2.5:7b',
      },
      features: ['Vulnerability Scan', 'Code Audit', 'Compliance Check', 'Reports'],
    },
  ];

  findAll(): AgentTemplate[] {
    return this.templates;
  }

  findOne(id: string): AgentTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }

  create(template: AgentTemplate): AgentTemplate {
    this.templates.push(template);
    return template;
  }

  getDefaultRouting(): AgentTemplate['routing'] {
    return {
      planning: 'openrouter/anthropic/claude-3.5-sonnet',
      coding: 'ollama/deepseek-coder-v2:latest',
      review: 'openrouter/anthropic/claude-3.5-sonnet',
      chat: 'ollama/llama3.1:8b',
      rag: 'ollama/qwen2.5:7b',
    };
  }
}
