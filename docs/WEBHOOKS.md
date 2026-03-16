# Webhooks

## Overview

Webhooks allow you to receive real-time notifications when events occur in ClawPilot.

## Supported Events

| Event | Description |
|-------|-------------|
| `agent.started` | Agent started running |
| `agent.stopped` | Agent stopped |
| `agent.failed` | Agent failed |
| `run.completed` | Agent run completed |
| `run.failed` | Agent run failed |
| `user.registered` | New user registered |

## Creating a Webhook

```bash
curl -X POST https://api.clawpilot.com/api/webhooks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "url": "https://your-server.com/webhook",
    "events": ["agent.started", "agent.stopped"],
    "secret": "your-webhook-secret"
  }'
```

## Webhook Payload

```json
{
  "event": "agent.started",
  "timestamp": "2026-03-16T12:00:00Z",
  "data": {
    "agent_id": 123,
    "agent_name": "Dev Assistant",
    "user_id": 456
  }
}
```

## Verifying Webhooks

Each webhook includes a signature in the `X-ClawPilot-Signature` header:

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

## Retry Policy

Failed webhook deliveries are retried up to 3 times with exponential backoff:
- 1st retry: 1 minute
- 2nd retry: 5 minutes
- 3rd retry: 30 minutes
