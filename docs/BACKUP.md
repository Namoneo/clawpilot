# Backup & Restore

## Overview

ClawPilot supports manual and automated database backups.

## Manual Backup

```bash
# Create a backup
curl -X POST https://api.clawpilot.com/api/backup \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response
{
  "id": "backup_123",
  "status": "completed",
  "size": "15MB",
  "createdAt": "2026-03-17T10:00:00Z",
  "downloadUrl": "/api/backup/download/backup_123"
}
```

## Scheduled Backups

Backups run automatically based on your plan:

| Plan | Frequency |
|------|-----------|
| Free | Weekly |
| Pro | Daily |
| Team | Hourly |

## Restore

```bash
# Restore from backup
curl -X POST https://api.clawpilot.com/api/backup/restore \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"backupId": "backup_123"}'
```

## Backup Contents

- All user data
- Agent configurations
- Team memberships
- API keys
- Settings

**Note:** Backup does NOT include billing information (handled by Stripe).
