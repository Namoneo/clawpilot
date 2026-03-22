import { DataSource } from 'typeorm';
import dataSource from './data-source';



async function seed() {
  console.log('🌱 Seeding database...');
  
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    // Check if data already exists
    const userCount = await queryRunner.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount[0].count) > 0) {
      console.log('⚠️ Database already has data. Skipping seed.');
      return;
    }

    // Seed default templates
    console.log('📋 Seeding templates...');
    await queryRunner.query(`
      INSERT INTO templates (id, name, description, routing, features, created_at, updated_at)
      VALUES 
      ('developer-assistant', 'Developer Assistant', 'AI coding assistant for software development', 
       '{"planning":"openrouter/anthropic/claude-3.5-sonnet","coding":"ollama/deepseek-coder-v2:latest","review":"openrouter/anthropic/claude-3.5-sonnet","chat":"ollama/llama3.1:8b","rag":"ollama/qwen2.5:7b"}',
       '["Code Generation","Bug Fixing","Code Review","Unit Tests"]', NOW(), NOW()),
      ('research-agent', 'Research Agent', 'AI agent for research and documentation',
       '{"planning":"openrouter/anthropic/claude-3.5-sonnet","coding":"ollama/qwen2.5:7b","review":"openrouter/anthropic/claude-3.5-sonnet","chat":"ollama/llama3.1:8b","rag":"ollama/qwen2.5:7b"}',
       '["Web Research","Documentation","Summarization","RAG"]', NOW(), NOW()),
      ('automation-agent', 'Automation Agent', 'AI agent for task automation',
       '{"planning":"openrouter/anthropic/claude-3.5-sonnet","coding":"ollama/deepseek-coder-v2:latest","review":"ollama/llama3.1:8b","chat":"ollama/llama3.1:8b","rag":"ollama/qwen2.5:7b"}',
       '["Task Automation","Workflows","Scheduling"]', NOW(), NOW())
    `);

    console.log('✅ Seed completed!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await queryRunner.release();
  }
}

seed();
