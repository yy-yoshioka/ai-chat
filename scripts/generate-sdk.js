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
}