# Section-13: OpenAPI & JS SDK 設計書

**todo-key: `openapi-sdk`**

## 概要
OpenAPI仕様書の作成とJavaScript SDKの自動生成システムを構築します。開発者が簡単にAPIを利用できるようにします。

## 実装範囲

### 1. OpenAPI仕様書 (`docs/openapi.yml`)
```yaml
openapi: 3.0.3
info:
  title: AI Chat API
  description: |
    AI Chat API provides endpoints for managing chatbots, knowledge bases, analytics, and more.
    
    ## Authentication
    All API endpoints require authentication using Bearer tokens.
    
    ## Rate Limiting
    API calls are rate limited to 1000 requests per hour per organization.
    
    ## Webhooks
    The API supports webhooks for real-time event notifications.
  version: 1.0.0
  contact:
    name: API Support
    email: support@ai-chat.com
    url: https://docs.ai-chat.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.ai-chat.com/v1
    description: Production server
  - url: https://staging-api.ai-chat.com/v1
    description: Staging server
  - url: http://localhost:3001/v1
    description: Development server

security:
  - bearerAuth: []

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token obtained from /auth/login

  schemas:
    # Error schemas
    Error:
      type: object
      required:
        - error
        - message
      properties:
        error:
          type: string
          example: "validation_error"
        message:
          type: string
          example: "Invalid input data"
        details:
          type: array
          items:
            type: object

    # Auth schemas
    LoginRequest:
      type: object
      required:
        - email
        - password
      properties:
        email:
          type: string
          format: email
          example: "user@example.com"
        password:
          type: string
          minLength: 8
          example: "password123"

    AuthResponse:
      type: object
      properties:
        token:
          type: string
          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        user:
          $ref: '#/components/schemas/User'
        organization:
          $ref: '#/components/schemas/Organization'

    # User schemas
    User:
      type: object
      properties:
        id:
          type: string
          example: "clp123abc"
        email:
          type: string
          format: email
        name:
          type: string
        roles:
          type: array
          items:
            type: string
            enum: [owner, org_admin, editor, viewer]
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    # Organization schemas
    Organization:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        slug:
          type: string
        settings:
          type: object
        createdAt:
          type: string
          format: date-time

    # Widget schemas
    Widget:
      type: object
      properties:
        id:
          type: string
        widgetKey:
          type: string
        name:
          type: string
        companyId:
          type: string
        isActive:
          type: boolean
        theme:
          type: string
          enum: [light, dark, auto]
        primaryColor:
          type: string
          pattern: "^#[0-9A-Fa-f]{6}$"
        createdAt:
          type: string
          format: date-time

    CreateWidgetRequest:
      type: object
      required:
        - name
        - companyId
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 100
        companyId:
          type: string
        theme:
          type: string
          enum: [light, dark, auto]
          default: light
        primaryColor:
          type: string
          pattern: "^#[0-9A-Fa-f]{6}$"
          default: "#007bff"

    # Chat schemas
    ChatMessage:
      type: object
      properties:
        id:
          type: string
        question:
          type: string
        answer:
          type: string
        tokens:
          type: integer
        userId:
          type: string
        widgetId:
          type: string
        createdAt:
          type: string
          format: date-time

    SendMessageRequest:
      type: object
      required:
        - message
        - widgetKey
      properties:
        message:
          type: string
          minLength: 1
          maxLength: 2000
        widgetKey:
          type: string
        userId:
          type: string

    # Knowledge Base schemas
    KnowledgeBase:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        type:
          type: string
          enum: [file, url, text]
        source:
          type: string
        status:
          type: string
          enum: [pending, processing, completed, failed]
        chunks:
          type: integer
        error:
          type: string
        createdAt:
          type: string
          format: date-time

    # Webhook schemas
    Webhook:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        url:
          type: string
          format: uri
        events:
          type: array
          items:
            type: string
            enum: [message.created, user.registered, chat.completed]
        isActive:
          type: boolean
        retryCount:
          type: integer
          minimum: 1
          maximum: 5
        timeout:
          type: integer
          minimum: 1000
          maximum: 60000

    # Analytics schemas
    AnalyticsData:
      type: object
      properties:
        totalMessages:
          type: integer
        totalUsers:
          type: integer
        avgSatisfaction:
          type: number
          format: float
        responseTime:
          type: number
          format: float
        period:
          type: string

paths:
  # Authentication endpoints
  /auth/login:
    post:
      tags:
        - Authentication
      summary: User login
      description: Authenticate user and receive JWT token
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '401':
          description: Invalid credentials
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /auth/logout:
    post:
      tags:
        - Authentication
      summary: User logout
      description: Invalidate JWT token
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Logout successful
        '401':
          description: Unauthorized

  # Widget endpoints
  /widgets:
    get:
      tags:
        - Widgets
      summary: List widgets
      description: Get all widgets for the authenticated organization
      security:
        - bearerAuth: []
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            minimum: 1
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
      responses:
        '200':
          description: List of widgets
          content:
            application/json:
              schema:
                type: object
                properties:
                  widgets:
                    type: array
                    items:
                      $ref: '#/components/schemas/Widget'
                  pagination:
                    type: object
                    properties:
                      page:
                        type: integer
                      limit:
                        type: integer
                      total:
                        type: integer
                      totalPages:
                        type: integer

    post:
      tags:
        - Widgets
      summary: Create widget
      description: Create a new chat widget
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateWidgetRequest'
      responses:
        '201':
          description: Widget created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Widget'
        '400':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /widgets/{widgetId}:
    get:
      tags:
        - Widgets
      summary: Get widget
      description: Get widget by ID
      security:
        - bearerAuth: []
      parameters:
        - name: widgetId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Widget details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Widget'
        '404':
          description: Widget not found

    put:
      tags:
        - Widgets
      summary: Update widget
      description: Update widget configuration
      security:
        - bearerAuth: []
      parameters:
        - name: widgetId
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateWidgetRequest'
      responses:
        '200':
          description: Widget updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Widget'

    delete:
      tags:
        - Widgets
      summary: Delete widget
      description: Delete a widget
      security:
        - bearerAuth: []
      parameters:
        - name: widgetId
          in: path
          required: true
          schema:
            type: string
      responses:
        '204':
          description: Widget deleted successfully
        '404':
          description: Widget not found

  # Chat endpoints
  /chat:
    post:
      tags:
        - Chat
      summary: Send message
      description: Send a message to the chatbot
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SendMessageRequest'
      responses:
        '200':
          description: Chat response
          content:
            application/json:
              schema:
                type: object
                properties:
                  response:
                    type: string
                  messageId:
                    type: string
                  tokens:
                    type: integer

  /chat/history:
    get:
      tags:
        - Chat
      summary: Get chat history
      description: Get chat message history for a widget
      security:
        - bearerAuth: []
      parameters:
        - name: widgetId
          in: query
          required: true
          schema:
            type: string
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 50
      responses:
        '200':
          description: Chat history
          content:
            application/json:
              schema:
                type: object
                properties:
                  messages:
                    type: array
                    items:
                      $ref: '#/components/schemas/ChatMessage'

  # Knowledge Base endpoints
  /knowledge-base:
    get:
      tags:
        - Knowledge Base
      summary: List knowledge bases
      security:
        - bearerAuth: []
      responses:
        '200':
          description: List of knowledge bases
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/KnowledgeBase'

    post:
      tags:
        - Knowledge Base
      summary: Upload knowledge base
      description: Upload a file or URL to the knowledge base
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
                name:
                  type: string
                type:
                  type: string
                  enum: [file, url]
      responses:
        '201':
          description: Knowledge base created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/KnowledgeBase'

  # Webhooks endpoints
  /webhooks:
    get:
      tags:
        - Webhooks
      summary: List webhooks
      security:
        - bearerAuth: []
      responses:
        '200':
          description: List of webhooks
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Webhook'

    post:
      tags:
        - Webhooks
      summary: Create webhook
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - name
                - url
                - events
              properties:
                name:
                  type: string
                url:
                  type: string
                  format: uri
                events:
                  type: array
                  items:
                    type: string
      responses:
        '201':
          description: Webhook created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Webhook'

  # Analytics endpoints
  /analytics:
    get:
      tags:
        - Analytics
      summary: Get analytics data
      security:
        - bearerAuth: []
      parameters:
        - name: period
          in: query
          schema:
            type: string
            enum: [24h, 7d, 30d]
            default: 7d
        - name: widgetId
          in: query
          schema:
            type: string
      responses:
        '200':
          description: Analytics data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AnalyticsData'

tags:
  - name: Authentication
    description: User authentication and authorization
  - name: Widgets
    description: Chat widget management
  - name: Chat
    description: Chat messaging and history
  - name: Knowledge Base
    description: Knowledge base management
  - name: Webhooks
    description: Webhook configuration and management
  - name: Analytics
    description: Analytics and reporting

externalDocs:
  description: Find more info here
  url: https://docs.ai-chat.com
```

### 2. SDK生成スクリプト (`scripts/generate-sdk.js`)
```javascript
#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const generateSDK = async () => {
  console.log('🚀 Generating AI Chat JavaScript SDK...')

  // Ensure output directory exists
  const sdkDir = path.join(__dirname, '../sdk')
  if (!fs.existsSync(sdkDir)) {
    fs.mkdirSync(sdkDir, { recursive: true })
  }

  try {
    // Generate TypeScript client using openapi-generator
    console.log('📦 Generating TypeScript client...')
    execSync(`npx @openapitools/openapi-generator-cli generate \
      -i docs/openapi.yml \
      -g typescript-axios \
      -o ${sdkDir}/typescript \
      --additional-properties=npmName=@ai-chat/sdk,npmVersion=1.0.0,supportsES6=true`, 
      { stdio: 'inherit' }
    )

    // Generate package.json for SDK
    const packageJson = {
      name: '@ai-chat/sdk',
      version: '1.0.0',
      description: 'Official JavaScript SDK for AI Chat API',
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      scripts: {
        build: 'tsc',
        prepublishOnly: 'npm run build'
      },
      dependencies: {
        axios: '^1.6.0'
      },
      devDependencies: {
        typescript: '^5.0.0',
        '@types/node': '^20.0.0'
      },
      keywords: ['ai', 'chat', 'chatbot', 'api', 'sdk'],
      author: 'AI Chat Team',
      license: 'MIT',
      repository: {
        type: 'git',
        url: 'https://github.com/ai-chat/sdk-js.git'
      }
    }

    fs.writeFileSync(
      path.join(sdkDir, 'package.json'), 
      JSON.stringify(packageJson, null, 2)
    )

    // Create enhanced SDK wrapper
    createSDKWrapper(sdkDir)

    // Generate documentation
    generateDocumentation(sdkDir)

    console.log('✅ SDK generation completed successfully!')
    console.log(`📁 Output directory: ${sdkDir}`)

  } catch (error) {
    console.error('❌ SDK generation failed:', error.message)
    process.exit(1)
  }
}

const createSDKWrapper = (sdkDir) => {
  const wrapperContent = `
import { Configuration, AuthenticationApi, WidgetsApi, ChatApi, KnowledgeBaseApi, WebhooksApi, AnalyticsApi } from './typescript'
import axios, { AxiosInstance } from 'axios'

export interface AIChateSDKConfig {
  apiKey: string
  baseURL?: string
  timeout?: number
}

export class AIChatSDK {
  private config: Configuration
  private axiosInstance: AxiosInstance

  // API instances
  public auth: AuthenticationApi
  public widgets: WidgetsApi
  public chat: ChatApi
  public knowledgeBase: KnowledgeBaseApi
  public webhooks: WebhooksApi
  public analytics: AnalyticsApi

  constructor(config: AIChateSDKConfig) {
    this.axiosInstance = axios.create({
      baseURL: config.baseURL || 'https://api.ai-chat.com/v1',
      timeout: config.timeout || 30000,
      headers: {
        'Authorization': \`Bearer \${config.apiKey}\`,
        'Content-Type': 'application/json',
        'User-Agent': 'AI-Chat-SDK/1.0.0'
      }
    })

    this.config = new Configuration({
      basePath: config.baseURL || 'https://api.ai-chat.com/v1',
      accessToken: config.apiKey
    })

    // Initialize API instances
    this.auth = new AuthenticationApi(this.config, undefined, this.axiosInstance)
    this.widgets = new WidgetsApi(this.config, undefined, this.axiosInstance)
    this.chat = new ChatApi(this.config, undefined, this.axiosInstance)
    this.knowledgeBase = new KnowledgeBaseApi(this.config, undefined, this.axiosInstance)
    this.webhooks = new WebhooksApi(this.config, undefined, this.axiosInstance)
    this.analytics = new AnalyticsApi(this.config, undefined, this.axiosInstance)
  }

  // Convenience methods
  async sendMessage(widgetKey: string, message: string, userId?: string) {
    return this.chat.chatPost({
      message,
      widgetKey,
      userId
    })
  }

  async createWidget(data: any) {
    return this.widgets.widgetsPost(data)
  }

  async uploadKnowledgeBase(file: File, name: string) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', name)
    formData.append('type', 'file')

    return this.knowledgeBase.knowledgeBasePost(formData)
  }

  async getAnalytics(period = '7d', widgetId?: string) {
    return this.analytics.analyticsGet(period, widgetId)
  }

  // Error handling wrapper
  private async handleRequest<T>(request: Promise<T>): Promise<T> {
    try {
      return await request
    } catch (error: any) {
      if (error.response) {
        throw new Error(\`API Error: \${error.response.status} - \${error.response.data?.message || error.message}\`)
      }
      throw error
    }
  }
}

export default AIChatSDK
export * from './typescript'
`

  fs.writeFileSync(path.join(sdkDir, 'index.ts'), wrapperContent)
}

const generateDocumentation = (sdkDir) => {
  const readmeContent = `
# AI Chat JavaScript SDK

Official JavaScript/TypeScript SDK for the AI Chat API.

## Installation

\`\`\`bash
npm install @ai-chat/sdk
\`\`\`

## Quick Start

\`\`\`typescript
import AIChatSDK from '@ai-chat/sdk'

const client = new AIChatSDK({
  apiKey: 'your-api-key',
  baseURL: 'https://api.ai-chat.com/v1' // optional
})

// Send a message
const response = await client.sendMessage('widget-key', 'Hello!')
console.log(response.data.response)

// Create a widget
const widget = await client.createWidget({
  name: 'My Widget',
  companyId: 'company-123'
})

// Upload knowledge base
const file = new File(['content'], 'document.txt')
await client.uploadKnowledgeBase(file, 'My Document')
\`\`\`

## API Reference

### Authentication

\`\`\`typescript
// Login
const authResponse = await client.auth.authLoginPost({
  email: 'user@example.com',
  password: 'password'
})
\`\`\`

### Widgets

\`\`\`typescript
// List widgets
const widgets = await client.widgets.widgetsGet()

// Get widget by ID
const widget = await client.widgets.widgetsWidgetIdGet('widget-id')

// Update widget
const updated = await client.widgets.widgetsWidgetIdPut('widget-id', {
  name: 'Updated Name'
})

// Delete widget
await client.widgets.widgetsWidgetIdDelete('widget-id')
\`\`\`

### Chat

\`\`\`typescript
// Send message
const response = await client.chat.chatPost({
  message: 'Hello, how can you help?',
  widgetKey: 'widget-key-123',
  userId: 'user-123' // optional
})

// Get chat history
const history = await client.chat.chatHistoryGet('widget-id')
\`\`\`

### Knowledge Base

\`\`\`typescript
// List knowledge bases
const kbs = await client.knowledgeBase.knowledgeBaseGet()

// Upload file
const formData = new FormData()
formData.append('file', file)
formData.append('name', 'Document Name')
await client.knowledgeBase.knowledgeBasePost(formData)
\`\`\`

### Webhooks

\`\`\`typescript
// List webhooks
const webhooks = await client.webhooks.webhooksGet()

// Create webhook
const webhook = await client.webhooks.webhooksPost({
  name: 'My Webhook',
  url: 'https://example.com/webhook',
  events: ['message.created', 'user.registered']
})
\`\`\`

### Analytics

\`\`\`typescript
// Get analytics
const analytics = await client.analytics.analyticsGet('7d', 'widget-id')
\`\`\`

## Error Handling

\`\`\`typescript
try {
  const response = await client.sendMessage('widget-key', 'Hello!')
} catch (error) {
  console.error('API Error:', error.message)
}
\`\`\`

## TypeScript Support

This SDK is written in TypeScript and includes full type definitions.

\`\`\`typescript
import { Widget, ChatMessage, AnalyticsData } from '@ai-chat/sdk'

const widget: Widget = await client.widgets.widgetsWidgetIdGet('widget-id')
\`\`\`

## License

MIT
`

  fs.writeFileSync(path.join(sdkDir, 'README.md'), readmeContent)

  // TypeScript configuration
  const tsConfig = {
    compilerOptions: {
      target: 'ES2018',
      module: 'commonjs',
      lib: ['ES2018'],
      declaration: true,
      outDir: './dist',
      rootDir: './src',
      strict: true,
      noImplicitAny: true,
      strictNullChecks: true,
      strictFunctionTypes: true,
      noImplicitThis: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist']
  }

  fs.writeFileSync(
    path.join(sdkDir, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2)
  )
}

// Export for use in other scripts
module.exports = { generateSDK }

// Run if called directly
if (require.main === module) {
  generateSDK()
}yml \
      -g typescript-axios \
      -o ${sdkDir}/typescript \
      --additional-properties=npmName=@ai-chat/sdk,npmVersion=1.0.0,supportsES6=true`, 
      { stdio: 'inherit' }
    )

    // Generate package.json for SDK
    const packageJson = {
      name: '@ai-chat/sdk',
      version: '1.0.0',
      description: 'Official JavaScript SDK for AI Chat API',
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      scripts: {
        build: 'tsc',
        prepublishOnly: 'npm run build'
      },
      dependencies: {
        axios: '^1.6.0'
      },
      devDependencies: {
        typescript: '^5.0.0',
        '@types/node': '^20.0.0'
      },
      keywords: ['ai', 'chat', 'chatbot', 'api', 'sdk'],
      author: 'AI Chat Team',
      license: 'MIT',
      repository: {
        type: 'git',
        url: 'https://github.com/ai-chat/sdk-js.git'
      }
    }

    fs.writeFileSync(
      path.join(sdkDir, 'package.json'), 
      JSON.stringify(packageJson, null, 2)
    )

    // Create enhanced SDK wrapper
    createSDKWrapper(sdkDir)

    // Generate documentation
    generateDocumentation(s