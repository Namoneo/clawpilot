import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModelConfigService } from './model-config.service';
import { ModelConfigController } from './model-config.controller';
import { ModelConfig } from './entities/model-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ModelConfig])],
  controllers: [ModelConfigController],
  providers: [ModelConfigService],
  exports: [ModelConfigService],
})
export class ModelConfigModule {}

// Default model configurations
export const DEFAULT_MODELS = {
  // Planning & Reasoning
  planning: 'openrouter/anthropic/claude-3.5-sonnet',
  
  // Coding
  coding: 'ollama/deepseek-coder-v2:latest',
  codingFallback: 'ollama/qwen2.5:7b',
  
  // Chat/Conversation
  chat: 'ollama/llama3.1:8b',
  
  // RAG/Embeddings
  rag: 'ollama/qwen2.5:7b',
  embeddings: 'ollama/nomic-embed-text:latest',
  
  // Review
  review: 'openrouter/anthropic/claude-3.5-sonnet',
};

// Available providers
export const AVAILABLE_PROVIDERS = [
  { id: 'openrouter', name: 'OpenRouter', models: [
    'openrouter/anthropic/claude-3.5-sonnet',
    'openrouter/anthropic/claude-3-haiku',
    'openrouter/google/gemini-pro',
    'openrouter/mistralai/mistral-7b',
    'openrouter/openai/gpt-4',
  ]},
  { id: 'ollama', name: 'Ollama (Local)', models: [
    'ollama/deepseek-coder-v2:latest',
    'ollama/deepseek-coder:6.7b',
    'ollama/qwen2.5:7b',
    'ollama/qwen2.5:3b',
    'ollama/llama3.1:8b',
    'ollama/codellama:7b',
  ]},
  { id: 'moonshot', name: 'Moonshot (Kimi)', models: [
    'moonshot/kimi-k2.5',
  ]},
];
