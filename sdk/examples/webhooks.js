const AIChatSDK = require('@ai-chat/sdk').default
const crypto = require('crypto')
const express = require('express')

// Initialize the SDK
const client = new AIChatSDK({
  apiKey: process.env.AI_CHAT_API_KEY,
  baseURL: process.env.AI_CHAT_API_URL || 'https://api.ai-chat.com/v1'
})

/**
 * Example: Webhook Management
 */
async function webhookManagementExample() {
  try {
    console.log('🔔 Webhook Management Example\n')
    
    // 1. Create a webhook
    console.log('1. Creating a webhook...')
    const webhook = await client.webhooks.create({
      name: 'Production Message Handler',
      url: 'https://example.com/webhooks/ai-chat',
      events: ['message.created', 'user.registered', 'chat.completed'],
      retryCount: 3,
      timeout: 30000
    })
    console.log('✓ Created webhook:', webhook.name)
    console.log('  ID:', webhook.id)
    console.log('  URL:', webhook.url)
    console.log('  Events:', webhook.events.join(', '))
    console.log('  Secret:', webhook.secret ? '***hidden***' : 'Not set')
    
    // 2. Test the webhook
    console.log('\n2. Testing webhook...')
    const testResult = await client.webhooks.testWebhook(webhook.id)
    console.log('✓ Test result:', testResult.success ? 'Success' : 'Failed')
    console.log('  Message:', testResult.message)
    
    // 3. List all webhooks
    console.log('\n3. Listing all webhooks...')
    const allWebhooks = await client.webhooks.list()
    console.log(`✓ Found ${allWebhooks.length} webhooks:`)
    allWebhooks.forEach(wh => {
      console.log(`  - ${wh.name} (${wh.isActive ? 'Active' : 'Inactive'})`)
      console.log(`    Events: ${wh.events.join(', ')}`)
    })
    
    // 4. Update webhook
    console.log('\n4. Updating webhook...')
    const updated = await client.webhooks.update(webhook.id, {
      events: ['message.created', 'chat.completed'],
      retryCount: 5
    })
    console.log('✓ Updated webhook events:', updated.events.join(', '))
    console.log('  New retry count:', updated.retryCount)
    
    // 5. Toggle webhook status
    console.log('\n5. Toggling webhook status...')
    const disabled = await client.webhooks.toggle(webhook.id, false)
    console.log('✓ Webhook disabled:', !disabled.isActive)
    
    const enabled = await client.webhooks.toggle(webhook.id, true)
    console.log('✓ Webhook enabled:', enabled.isActive)
    
    // 6. Regenerate webhook secret
    console.log('\n6. Regenerating webhook secret...')
    const { secret } = await client.webhooks.regenerateSecret(webhook.id)
    console.log('✓ New secret generated (keep this secure!):', secret)
    
    // 7. Get webhook logs
    console.log('\n7. Fetching webhook logs...')
    const { logs } = await client.webhooks.getLogs(webhook.id, {
      page: 1,
      limit: 10
    })
    console.log(`✓ Found ${logs.length} webhook logs`)
    logs.forEach(log => {
      console.log(`  - ${log.event} at ${new Date(log.createdAt).toLocaleString()}`)
      console.log(`    Status: ${log.status}${log.statusCode ? ` (${log.statusCode})` : ''}`)
      if (log.error) {
        console.log(`    Error: ${log.error}`)
      }
    })
    
    // 8. Clean up
    console.log('\n8. Cleaning up...')
    await client.webhooks.delete(webhook.id)
    console.log('✓ Deleted test webhook')
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

/**
 * Example: Webhook endpoint implementation
 */
function webhookEndpointExample() {
  console.log('\n🌐 Webhook Endpoint Example\n')
  
  const app = express()
  app.use(express.json())
  
  // Webhook signature validation
  function validateSignature(payload, signature, secret) {
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(payload)
    const calculatedSignature = hmac.digest('hex')
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature)
    )
  }
  
  // Webhook endpoint
  app.post('/webhooks/ai-chat', (req, res) => {
    const signature = req.headers['x-webhook-signature']
    const secret = process.env.WEBHOOK_SECRET || 'your-webhook-secret'
    
    // Validate signature
    const payload = JSON.stringify(req.body)
    if (!validateSignature(payload, signature, secret)) {
      console.error('❌ Invalid webhook signature')
      return res.status(401).json({ error: 'Invalid signature' })
    }
    
    // Process webhook event
    const { event, data } = req.body
    
    console.log(`📨 Received webhook: ${event}`)
    console.log('  Data:', JSON.stringify(data, null, 2))
    
    // Handle different event types
    switch (event) {
      case 'message.created':
        console.log('  New message from:', data.userId || 'Anonymous')
        console.log('  Question:', data.question)
        console.log('  Answer:', data.answer)
        break
        
      case 'user.registered':
        console.log('  New user registered:', data.email)
        console.log('  Organization:', data.organizationName)
        break
        
      case 'chat.completed':
        console.log('  Chat session completed')
        console.log('  Total messages:', data.messageCount)
        console.log('  Duration:', data.duration, 'seconds')
        break
        
      default:
        console.log('  Unknown event type:', event)
    }
    
    // Acknowledge receipt
    res.status(200).json({ received: true })
  })
  
  const PORT = process.env.PORT || 3002
  console.log(`Example webhook endpoint: http://localhost:${PORT}/webhooks/ai-chat`)
  console.log('(This is just an example - in production, use HTTPS and proper error handling)\n')
}

/**
 * Example: Webhook retry handling
 */
async function webhookRetryExample() {
  console.log('\n🔄 Webhook Retry Handling Example\n')
  
  // Simulated webhook delivery with retry logic
  async function deliverWebhook(url, payload, secret, maxRetries = 3) {
    const signature = crypto.createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex')
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries}: Delivering to ${url}`)
        
        // Simulate HTTP request (in real code, use axios or fetch)
        const response = await simulateHttpRequest(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature
          },
          body: JSON.stringify(payload)
        })
        
        if (response.status >= 200 && response.status < 300) {
          console.log('✓ Webhook delivered successfully')
          return { success: true, attempts: attempt }
        }
        
        throw new Error(`HTTP ${response.status}`)
        
      } catch (error) {
        console.log(`✗ Attempt ${attempt} failed:`, error.message)
        
        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000
          console.log(`  Retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    console.log('✗ Webhook delivery failed after all retries')
    return { success: false, attempts: maxRetries }
  }
  
  // Simulate HTTP request (for demo purposes)
  async function simulateHttpRequest(url, options) {
    // Randomly succeed or fail for demonstration
    const shouldSucceed = Math.random() > 0.3
    
    if (shouldSucceed) {
      return { status: 200 }
    } else {
      throw new Error('Connection timeout')
    }
  }
  
  // Example usage
  const webhookPayload = {
    event: 'message.created',
    data: {
      messageId: 'msg-123',
      widgetId: 'widget-456',
      question: 'What are your business hours?',
      answer: 'We are open Monday to Friday, 9 AM to 6 PM EST.',
      timestamp: new Date().toISOString()
    }
  }
  
  const result = await deliverWebhook(
    'https://example.com/webhook',
    webhookPayload,
    'webhook-secret-key'
  )
  
  console.log('\nDelivery result:', result)
}

// Run examples
async function main() {
  await webhookManagementExample()
  webhookEndpointExample()
  await webhookRetryExample()
}

main()