# Security Features

## API Credentials Encryption

All third-party API credentials (OpenAI, Stripe, Zendesk, Intercom, etc.) are now stored with AES-256-GCM encryption in the database instead of plain text environment variables.

### Features:

- **Encryption**: AES-256-GCM with per-credential salt and IV
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Organization Isolation**: Each organization has its own encrypted credentials
- **Audit Logging**: All credential operations are logged
- **Automatic Expiration**: Support for credential expiration dates

### Migration:

To migrate existing environment variable credentials to encrypted storage:

```bash
yarn ts-node src/scripts/migrateApiCredentials.ts <organizationId>
```

### API Endpoints:

- `GET /api/api-credentials` - List credentials (without decrypting)
- `POST /api/api-credentials` - Create new encrypted credentials
- `PUT /api/api-credentials/:id` - Update credentials
- `DELETE /api/api-credentials/:id` - Delete credentials
- `POST /api/api-credentials/test` - Test credentials without storing

## Chat Endpoint Rate Limiting

Enhanced rate limiting for chat endpoints to prevent abuse and ensure fair usage.

### Features:

- **Dual Rate Limiting**: Both IP-based and organization-based limits
- **Sliding Window**: Accurate rate limiting with Redis-backed sliding window
- **Fallback**: Automatic fallback to in-memory store if Redis is unavailable
- **Headers**: Standard rate limit headers in responses
- **Security Logging**: Rate limit violations are logged as security events

### Default Limits:

- **IP Rate Limit**: 100 requests per minute per IP address
- **Organization Rate Limit**: 1000 requests per hour per organization

### Rate Limit Headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2024-07-03T12:34:56.789Z
X-RateLimit-Org-Limit: 1000
X-RateLimit-Org-Remaining: 950
X-RateLimit-Org-Reset: 2024-07-03T13:00:00.000Z
```

### Monitoring Endpoints:

- `GET /api/rate-limit/status` - Get current rate limit status
- `POST /api/rate-limit/reset` - Reset rate limits (admin only)
- `GET /api/rate-limit/admin/status/:type/:key` - Check any key's status (admin only)

## Environment Variables

### Required Security Configuration:

```env
# JWT Secret (Required)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Encryption Key (Optional - falls back to JWT_SECRET)
ENCRYPTION_KEY=your-super-secret-encryption-key-change-this-in-production

# Redis URL (Required for distributed rate limiting)
REDIS_URL=redis://localhost:6379
```

## Security Best Practices

1. **Rotate Keys Regularly**: Use the credential rotation feature to update API keys periodically
2. **Monitor Rate Limits**: Check rate limit status regularly to identify potential abuse
3. **Audit Logs**: Review security audit logs for suspicious activity
4. **Least Privilege**: Grant only necessary permissions to users
5. **Environment Isolation**: Use different encryption keys for different environments

## Compliance

- **Data Encryption**: All sensitive credentials encrypted at rest
- **Audit Trail**: Complete audit logging for security events
- **Access Control**: RBAC-based permission system
- **Rate Limiting**: Protection against abuse and DDoS
- **Data Retention**: Configurable retention policies for compliance
