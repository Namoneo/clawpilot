# Security

## Authentication

All API endpoints (except `/api/auth/register` and `/api/auth/login`) require JWT authentication:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://api.clawpilot.com/api/agents
```

## API Keys

For programmatic access, create API keys:

```bash
# Create API key
curl -X POST https://api.clawpilot.com/api/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name": "My Key", "permissions": ["agent:read", "agent:create"]}'
```

## Rate Limiting

See [RATE-LIMITING.md](RATE-LIMITING.md)

## Best Practices

1. **Never expose JWT secret** in client-side code
2. **Use API keys** for server-to-server communication
3. **Enable 2FA** on GitHub account (for OAuth)
4. **Rotate API keys** regularly
5. **Use HTTPS** in production

## Reporting Security Issues

If you find a security vulnerability, please open a private issue instead of a public one.
