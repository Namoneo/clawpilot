# Rate Limiting

## API Rate Limits

| Plan | Requests/minute | Burst |
|------|-----------------|-------|
| Free | 60 | 100 |
| Pro | 300 | 500 |
| Team | 1000 | 1500 |

## Per-Endpoint Limits

| Endpoint | Limit |
|----------|-------|
| `/api/auth/*` | 10/min |
| `/api/agents` | 60/min |
| `/api/agents/:id/start` | 30/min |
| `/api/analytics/*` | 30/min |

## Configuration

```yaml
# config/rate-limit.yaml
limits:
  default:
    ttl: 60000 # 1 minute
    limit: 60
    
  auth:
    ttl: 60000
    limit: 10
    
  agents:
    ttl: 60000
    limit: 60
```

## Implementation

Rate limiting is implemented using `@nestjs/throttler`:

```typescript
@UseGuards(ThrottlerGuard)
export class AgentsController {}
```
