export const AGENT_TEMPLATES = [
  {
    id: 'developer-assistant',
    name: 'Developer Assistant',
    description: 'AI coding assistant for software development',
    routing: {
      planning: 'openrouter/anthropic/claude-3.5-sonnet',
      coding: 'ollama/deepseek-coder-v2:latest',
      review: 'openrouter/anthropic/claude-3.5-sonnet',
      chat: 'ollama/llama3.1:8b',
      rag: 'ollama/qwen2.5:7b',
    },
  },
  {
    id: 'research-agent',
    name: 'Research Agent',
    description: 'AI agent for research and documentation',
    routing: {
      planning: 'openrouter/anthropic/claude-3.5-sonnet',
      coding: 'ollama/qwen2.5:7b',
      review: 'openrouter/anthropic/claude-3.5-sonnet',
      chat: 'ollama/llama3.1:8b',
      rag: 'ollama/qwen2.5:7b',
    },
  },
  {
    id: 'automation-agent',
    name: 'Automation Agent',
    description: 'AI agent for task automation',
    routing: {
      planning: 'openrouter/anthropic/claude-3.5-sonnet',
      coding: 'ollama/deepseek-coder-v2:latest',
      review: 'ollama/llama3.1:8b',
      chat: 'ollama/llama3.1:8b',
      rag: 'ollama/qwen2.5:7b',
    },
  },
];
