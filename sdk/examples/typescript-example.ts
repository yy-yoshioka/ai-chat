import AIChatSDK, { 
  Widget, 
  ChatMessage, 
  Webhook,
  KnowledgeBase,
  AnalyticsData,
  CreateWidgetRequest,
  SendMessageRequest
} from '@ai-chat/sdk'

// Initialize with type safety
const client = new AIChatSDK({
  apiKey: process.env.AI_CHAT_API_KEY!,
  baseURL: process.env.AI_CHAT_API_URL || 'https://api.ai-chat.com/v1',
  timeout: 30000
})

/**
 * TypeScript Example: Type-safe API usage
 */
async function typeScriptExample(): Promise<void> {
  try {
    console.log('🔷 TypeScript SDK Example\n')
    
    // 1. Create a widget with full type checking
    const widgetData: CreateWidgetRequest = {
      name: 'TypeScript Widget',
      companyId: 'company-123',
      theme: 'dark',
      primaryColor: '#007bff'
    }
    
    const newWidget: Widget = await client.widgets.create(widgetData)
    console.log('✓ Created widget:', newWidget.name)
    console.log('  Type:', newWidget.theme)
    
    // 2. Send a message with proper typing
    const messageRequest: SendMessageRequest = {
      message: 'What is TypeScript?',
      widgetKey: newWidget.widgetKey,
      userId: 'ts-user-123'
    }
    
    const response = await client.chat.sendMessage(messageRequest)
    console.log('\n✓ Bot response:', response.response)
    
    // 3. Work with analytics data
    const analytics: AnalyticsData = await client.analytics.get('7d', newWidget.id)
    displayAnalytics(analytics)
    
    // 4. Create a webhook with typed events
    const webhook: Webhook = await client.webhooks.create({
      name: 'TypeScript Webhook',
      url: 'https://example.com/webhook',
      events: ['message.created', 'chat.completed'], // Type-checked array
      retryCount: 3,
      timeout: 30000
    })
    
    console.log('\n✓ Created webhook with events:', webhook.events.join(', '))
    
    // 5. Handle optional properties safely
    if (webhook.secret) {
      console.log('  Webhook has a secret configured')
    }
    
    // 6. Error handling with proper types
    try {
      await client.widgets.get('invalid-id')
    } catch (error) {
      if (error instanceof Error) {
        console.log('\n✓ Error handled:', error.message)
      }
    }
    
    // 7. Clean up
    await client.widgets.delete(newWidget.id)
    await client.webhooks.delete(webhook.id)
    console.log('\n✓ Cleanup completed')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

/**
 * Helper function with proper typing
 */
function displayAnalytics(data: AnalyticsData): void {
  console.log('\n📊 Analytics Data:')
  console.log(`  Total Messages: ${data.totalMessages}`)
  console.log(`  Total Users: ${data.totalUsers}`)
  console.log(`  Avg Satisfaction: ${data.avgSatisfaction.toFixed(2)}`)
  console.log(`  Response Time: ${data.responseTime.toFixed(0)}ms`)
  console.log(`  Period: ${data.period}`)
}

/**
 * Example: Custom types and interfaces
 */
interface ChatSession {
  widgetKey: string
  userId: string
  messages: ChatMessage[]
  startTime: Date
  endTime?: Date
}

class ChatSessionManager {
  private sessions: Map<string, ChatSession> = new Map()
  
  constructor(private client: AIChatSDK) {}
  
  async startSession(widgetKey: string, userId: string): Promise<ChatSession> {
    const session: ChatSession = {
      widgetKey,
      userId,
      messages: [],
      startTime: new Date()
    }
    
    this.sessions.set(userId, session)
    return session
  }
  
  async sendMessage(userId: string, message: string): Promise<ChatMessage | null> {
    const session = this.sessions.get(userId)
    if (!session) {
      console.error('No active session for user:', userId)
      return null
    }
    
    const response = await this.client.chat.sendMessage({
      message,
      widgetKey: session.widgetKey,
      userId
    })
    
    // Create a chat message object
    const chatMessage: ChatMessage = {
      id: response.messageId,
      question: message,
      answer: response.response,
      tokens: response.tokens,
      userId,
      widgetId: session.widgetKey,
      createdAt: new Date().toISOString()
    }
    
    session.messages.push(chatMessage)
    return chatMessage
  }
  
  endSession(userId: string): ChatSession | undefined {
    const session = this.sessions.get(userId)
    if (session) {
      session.endTime = new Date()
      this.sessions.delete(userId)
    }
    return session
  }
  
  getActiveSessionCount(): number {
    return this.sessions.size
  }
}

/**
 * Example: Using the session manager
 */
async function sessionManagerExample(): Promise<void> {
  console.log('\n💬 Chat Session Manager Example\n')
  
  const sessionManager = new ChatSessionManager(client)
  
  // Get a widget
  const { widgets } = await client.widgets.list({ limit: 1 })
  if (widgets.length === 0) {
    console.log('No widgets available')
    return
  }
  
  const widgetKey = widgets[0].widgetKey
  
  // Start a session
  const session = await sessionManager.startSession(widgetKey, 'user-456')
  console.log('✓ Started session for user-456')
  
  // Send messages
  const messages = [
    'Hello!',
    'What services do you offer?',
    'How can I contact support?'
  ]
  
  for (const msg of messages) {
    console.log(`\n👤 User: ${msg}`)
    const response = await sessionManager.sendMessage('user-456', msg)
    if (response) {
      console.log(`🤖 Bot: ${response.answer}`)
      console.log(`   (Tokens: ${response.tokens})`)
    }
  }
  
  // End session
  const completedSession = sessionManager.endSession('user-456')
  if (completedSession) {
    console.log('\n✓ Session ended')
    console.log(`  Duration: ${((completedSession.endTime!.getTime() - completedSession.startTime.getTime()) / 1000).toFixed(1)}s`)
    console.log(`  Messages: ${completedSession.messages.length}`)
  }
}

/**
 * Example: Type guards and utility functions
 */
function isWidget(obj: any): obj is Widget {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.widgetKey === 'string' &&
    typeof obj.name === 'string'
}

function isKnowledgeBaseCompleted(kb: KnowledgeBase): boolean {
  return kb.status === 'completed'
}

async function waitForKnowledgeBase(
  client: AIChatSDK, 
  kbId: string, 
  maxWaitTime: number = 60000
): Promise<KnowledgeBase> {
  const startTime = Date.now()
  
  while (Date.now() - startTime < maxWaitTime) {
    const kb = await client.knowledgeBase.get(kbId)
    
    if (isKnowledgeBaseCompleted(kb) || kb.status === 'failed') {
      return kb
    }
    
    // Wait 2 seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  throw new Error('Knowledge base processing timeout')
}

// Run examples
async function main(): Promise<void> {
  await typeScriptExample()
  await sessionManagerExample()
}

main().catch(console.error)