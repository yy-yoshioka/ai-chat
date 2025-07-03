# Phase 2 API Documentation - User and Organization Management

## Overview

This document describes the enhanced User and Organization Management APIs implemented in Phase 2 of the private beta launch.

## Authentication

All endpoints require authentication via JWT token in either:

- Authorization header: `Bearer <token>`
- Cookie: `token=<token>`

## User Management APIs

### List Users

```http
GET /api/users
```

Query Parameters:

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search by name or email
- `role` (string): Filter by role (owner, admin, member, guest, api, readonly)
- `status` (string): Filter by status

Required Permission: `ORG_READ`

Response:

```json
{
  "users": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "roles": ["viewer"],
      "isEmailVerified": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

### Get Single User

```http
GET /api/users/:id
```

Required Permission: `ORG_READ`

Response:

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "roles": ["editor"],
  "isEmailVerified": true,
  "permissionOverrides": [
    {
      "permission": "WIDGET_DELETE",
      "granted": true
    }
  ],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Invite User

```http
POST /api/users/invite
```

Required Permission: `ORG_INVITE_USERS`

Request Body:

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "roles": ["viewer"]
}
```

Response:

```json
{
  "success": true,
  "invitationId": "string",
  "message": "Invitation sent successfully"
}
```

### Update User

```http
PUT /api/users/:id
```

Required Permission: `ORG_WRITE` (or own profile without role changes)

Request Body:

```json
{
  "name": "Updated Name",
  "email": "new@example.com",
  "roles": ["editor"]
}
```

### Delete User

```http
DELETE /api/users/:id
```

Required Permission: `ORG_WRITE`

Response:

```json
{
  "success": true
}
```

### List Invitations

```http
GET /api/users/invitations
```

Required Permission: `ORG_INVITE_USERS`

Response:

```json
[
  {
    "id": "string",
    "email": "invited@example.com",
    "name": "Invited User",
    "roles": ["viewer"],
    "invitedBy": {
      "id": "string",
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "expiresAt": "2024-01-08T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### Resend Invitation

```http
POST /api/users/invitations/:id/resend
```

Required Permission: `ORG_INVITE_USERS`

Response:

```json
{
  "success": true,
  "expiresAt": "2024-01-08T00:00:00Z"
}
```

### Cancel Invitation

```http
DELETE /api/users/invitations/:id
```

Required Permission: `ORG_INVITE_USERS`

### Accept Invitation (Public)

```http
POST /api/users/accept-invitation
```

No authentication required

Request Body:

```json
{
  "token": "invitation-token",
  "password": "newpassword123"
}
```

Response:

```json
{
  "success": true,
  "userId": "string",
  "email": "user@example.com",
  "message": "Invitation accepted successfully"
}
```

## Organization Management APIs

### List Organizations

```http
GET /api/organizations
```

Response:

```json
[
  {
    "id": "string",
    "name": "My Organization",
    "slug": "my-org",
    "_count": {
      "users": 10,
      "companies": 2
    },
    "companies": [
      {
        "id": "string",
        "name": "Company Name",
        "_count": {
          "widgets": 5
        }
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### Create Organization

```http
POST /api/organizations
```

Request Body:

```json
{
  "name": "New Organization",
  "slug": "new-org"
}
```

### Get Organization Details

```http
GET /api/organizations/:id
```

Required Permission: `ORG_READ`

Response includes full organization data with users, companies, widgets, and statistics.

### Update Organization

```http
PUT /api/organizations/:id
```

Required Permission: `ORG_WRITE`

Request Body:

```json
{
  "name": "Updated Name",
  "slug": "updated-slug",
  "settings": {
    "dashboard": {
      "layout": []
    }
  }
}
```

### Delete Organization

```http
DELETE /api/organizations/:id
```

Required Permission: `ORG_DELETE`

### Get Organization Statistics

```http
GET /api/organizations/:id/stats
```

Required Permission: `ANALYTICS_READ`

Query Parameters:

- `period`: day, week, or month (default: month)

Response:

```json
{
  "period": "month",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-02-01T00:00:00Z",
  "stats": {
    "totalChats": 1000,
    "dailyAverage": 33,
    "activeUsers": 25,
    "kbUpdates": 10,
    "topWidgets": [
      {
        "id": "string",
        "name": "Main Widget",
        "chatCount": 500
      }
    ]
  }
}
```

### Get Activity Log

```http
GET /api/organizations/:id/activity
```

Required Permission: `AUDIT_READ`

Query Parameters:

- `page` (number): Page number
- `limit` (number): Items per page

### Associate Widget

```http
POST /api/organizations/:id/widgets/associate
```

Required Permission: `WIDGET_WRITE`

Request Body:

```json
{
  "widgetId": "string",
  "companyId": "string" // optional
}
```

### Remove Widget

```http
DELETE /api/organizations/:id/widgets/:widgetId
```

Required Permission: `WIDGET_DELETE`

### Transfer Ownership

```http
POST /api/organizations/:id/transfer-ownership
```

Required: Current user must have `owner` role

Request Body:

```json
{
  "newOwnerId": "string"
}
```

### Get Organization Widgets

```http
GET /api/organizations/:id/widgets
```

Required Permission: `WIDGET_READ`

Response:

```json
[
  {
    "id": "string",
    "name": "Widget Name",
    "widgetKey": "widget-key",
    "isActive": true,
    "company": {
      "id": "string",
      "name": "Company Name",
      "plan": "pro"
    },
    "stats": {
      "totalChats": 100,
      "knowledgeBases": 5
    },
    "theme": {
      "primaryColor": "#007bff",
      "accentColor": "#6c757d",
      "theme": "light"
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

## Role Permissions

### Permission Matrix

| Role        | Permissions                                              |
| ----------- | -------------------------------------------------------- |
| `owner`     | All permissions                                          |
| `org_admin` | All except `ORG_DELETE`, `BILLING_WRITE`, `SYSTEM_ADMIN` |
| `editor`    | Content management permissions                           |
| `viewer`    | Read-only access                                         |
| `api_user`  | API-specific read permissions                            |
| `read_only` | Minimal read permissions                                 |

### Available Permissions

- **Organization**: `ORG_READ`, `ORG_WRITE`, `ORG_DELETE`, `ORG_INVITE_USERS`
- **Widget**: `WIDGET_READ`, `WIDGET_WRITE`, `WIDGET_DELETE`, `WIDGET_CONFIGURE`
- **Chat**: `CHAT_READ`, `CHAT_MODERATE`, `CHAT_EXPORT`
- **Knowledge Base**: `KB_READ`, `KB_WRITE`, `KB_DELETE`, `KB_TRAIN`
- **Analytics**: `ANALYTICS_READ`, `ANALYTICS_EXPORT`
- **Settings**: `SETTINGS_READ`, `SETTINGS_WRITE`
- **Billing**: `BILLING_READ`, `BILLING_WRITE`
- **System**: `SYSTEM_ADMIN`, `AUDIT_READ`

## Webhook Events

The following webhook events are triggered by these APIs:

- `user.invited` - When a user is invited
- `user.joined` - When an invitation is accepted
- `user.updated` - When a user is updated
- `user.deleted` - When a user is removed
- `organization.created` - When an organization is created
- `organization.updated` - When an organization is updated
- `organization.deleted` - When an organization is deleted
- `organization.ownership_transferred` - When ownership is transferred

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "errors": [
    // For validation errors
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

Common HTTP status codes:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resources)
- `429` - Rate Limited
- `500` - Internal Server Error
