export const healthChecks = {
  // Basic checks
  basic: {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    status: 'ok',
  },

  // Database check (add to health controller)
  database: async (dataSource) => {
    try {
      await dataSource.query('SELECT 1');
      return { status: 'up', latency: 0 };
    } catch (e) {
      return { status: 'down', error: e.message };
    }
  },

  // Redis check
  redis: async (redis) => {
    try {
      const start = Date.now();
      await redis.ping();
      return { status: 'up', latency: Date.now() - start };
    } catch (e) {
      return { status: 'down', error: e.message };
    }
  },

  // External APIs
  openrouter: async () => {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        method: 'HEAD',
      });
      return { status: response.ok ? 'up' : 'down' };
    } catch (e) {
      return { status: 'unavailable', error: e.message };
    }
  },

  // Ollama (local)
  ollama: async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags', {
        method: 'HEAD',
      });
      return { status: response.ok ? 'up' : 'down' };
    } catch (e) {
      return { status: 'unavailable', error: e.message };
    }
  },
};
