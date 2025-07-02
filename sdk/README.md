# AI Chat JavaScript SDK

Official JavaScript/TypeScript SDK for the AI Chat API.

## Installation

```bash
npm install @ai-chat/sdk
# or
yarn add @ai-chat/sdk
```

## Quick Start

```typescript
import AIChatSDK from '@ai-chat/sdk'

const client = new AIChatSDK({
  apiKey: 'your-api-key',
  baseURL: 'https://api.ai-chat.com/v1' // optional
})

// Send a message
const response = await client.sendMessage('widget-key', 'Hello!')
console.log(response.response)

// Create a widget
const widget = await client.createWidget({
  name: 'My Widget',
  companyId: 'company-123'
})

// Upload knowledge base
const file = new File(['content'], 'document.txt')
await client.uploadKnowledgeBase(file, 'My Document')

// Get analytics
const analytics = await client.getAnalytics('7d', widget.id)
console.log(`Total messages: ${analytics.totalMessages}`)
```

## API Reference

### Authentication

```typescript
// Login
const authResponse = await client.auth.login({
  email: 'user@example.com',
  password: 'password'
})

// Get current user
const me = await client.auth.getMe()

// Logout
await client.auth.logout()

// Password reset
await client.auth.forgotPassword('user@example.com')
await client.auth.resetPassword('reset-token', 'new-password')
```

### Widgets

```typescript
// List widgets
const { widgets, pagination } = await client.widgets.list({ page: 1, limit: 20 })

// Get widget by ID
const widget = await client.widgets.get('widget-id')

// Create widget
const newWidget = await client.widgets.create({
  name: 'Support Bot',
  companyId: 'company-123',
  theme: 'light',
  primaryColor: '#007bff'
})

// Update widget
const updated = await client.widgets.update('widget-id', {
  name: 'Updated Name',
  theme: 'dark'
})

// Delete widget
await client.widgets.delete('widget-id')

// Get embed code
const { code } = await client.widgets.getEmbedCode('widget-id')
```

### Chat

```typescript
// Send message
const response = await client.chat.sendMessage({
  message: 'Hello, how can you help?',
  widgetKey: 'widget-key-123',
  userId: 'user-123' // optional
})

// Get chat history
const { messages } = await client.chat.getHistory('widget-id', {
  page: 1,
  limit: 50
})

// Provide feedback
await client.chat.provideFeedback('message-id', 'positive')

// Export conversation
const blob = await client.chat.exportConversation('widget-id', 'csv')
```

### Knowledge Base

```typescript
// List knowledge bases
const kbs = await client.knowledgeBase.list()

// Upload file
const file = new File(['content'], 'document.txt')
const formData = new FormData()
formData.append('file', file)
formData.append('name', 'My Document')
const kb = await client.knowledgeBase.upload(formData)

// Upload from URL
const urlKb = await client.knowledgeBase.uploadFromURL(
  'https://example.com/doc.pdf',
  'External Document'
)

// Upload text
const textKb = await client.knowledgeBase.uploadText(
  'This is the content...',
  'Text Document'
)

// Check processing status
const { status, progress } = await client.knowledgeBase.getStatus('kb-id')

// Delete knowledge base
await client.knowledgeBase.delete('kb-id')
```

### Webhooks

```typescript
// List webhooks
const webhooks = await client.webhooks.list()

// Create webhook
const webhook = await client.webhooks.create({
  name: 'My Webhook',
  url: 'https://example.com/webhook',
  events: ['message.created', 'user.registered'],
  retryCount: 3,
  timeout: 30000
})

// Update webhook
const updated = await client.webhooks.update('webhook-id', {
  events: ['message.created', 'chat.completed']
})

// Toggle webhook
await client.webhooks.toggle('webhook-id', false) // disable

// Get webhook logs
const { logs } = await client.webhooks.getLogs('webhook-id', {
  page: 1,
  limit: 100
})

// Test webhook
const { success, message } = await client.webhooks.testWebhook('webhook-id')

// Regenerate secret
const { secret } = await client.webhooks.regenerateSecret('webhook-id')

// Delete webhook
await client.webhooks.delete('webhook-id')
```

### Analytics

```typescript
// Get basic analytics
const analytics = await client.analytics.get('7d', 'widget-id')

// Get detailed analytics
const detailed = await client.analytics.getDetailed('30d', 'widget-id')
console.log(detailed.topQuestions)
console.log(detailed.userSatisfaction)
console.log(detailed.peakHours)

// Get conversation flow
const flow = await client.analytics.getConversationFlow('widget-id', '7d')

// Get unresolved questions
const unresolved = await client.analytics.getUnresolvedQuestions('widget-id', 20)

// Export analytics report
const report = await client.analytics.exportReport('pdf', '30d', 'widget-id')

// Get usage metrics
const usage = await client.analytics.getUsageMetrics()
console.log(`Messages: ${usage.messagesUsed}/${usage.messagesLimit}`)
```

## Error Handling

```typescript
try {
  const response = await client.sendMessage('widget-key', 'Hello!')
} catch (error) {
  if (error.response) {
    // API error response
    console.error('API Error:', error.response.status, error.response.data)
  } else if (error.request) {
    // Network error
    console.error('Network Error:', error.message)
  } else {
    // Other error
    console.error('Error:', error.message)
  }
}
```

## TypeScript Support

This SDK is written in TypeScript and includes full type definitions.

```typescript
import { 
  Widget, 
  ChatMessage, 
  AnalyticsData,
  Webhook,
  KnowledgeBase 
} from '@ai-chat/sdk'

// All types are fully typed
const widget: Widget = await client.widgets.get('widget-id')
const message: ChatMessage = await client.chat.getMessage('message-id')
```

## Configuration

### Custom Axios Configuration

You can customize the underlying Axios instance:

```typescript
const client = new AIChatSDK({
  apiKey: 'your-api-key',
  baseURL: 'https://api.ai-chat.com/v1',
  timeout: 60000 // 60 seconds
})
```

### Environment Variables

You can also configure the SDK using environment variables:

```typescript
const client = new AIChatSDK({
  apiKey: process.env.AI_CHAT_API_KEY || '',
  baseURL: process.env.AI_CHAT_API_URL
})
```

## Rate Limiting

The API has rate limits of 1000 requests per hour per organization. The SDK will throw an error when rate limits are exceeded.

## Webhooks

For webhook signature validation, use the following example:

```typescript
import crypto from 'crypto'

function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payload)
  const calculatedSignature = hmac.digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  )
}
```

## License

MIT