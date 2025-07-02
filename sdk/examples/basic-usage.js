const AIChatSDK = require('@ai-chat/sdk').default

// Initialize the SDK
const client = new AIChatSDK({
  apiKey: process.env.AI_CHAT_API_KEY || 'your-api-key',
  baseURL: process.env.AI_CHAT_API_URL || 'https://api.ai-chat.com/v1'
})

async function main() {
  try {
    // 1. Authentication
    console.log('1. Authenticating...')
    const authResponse = await client.auth.login({
      email: 'user@example.com',
      password: 'password123'
    })
    console.log('✓ Logged in as:', authResponse.user.email)

    // 2. List widgets
    console.log('\n2. Listing widgets...')
    const { widgets } = await client.widgets.list()
    console.log(`✓ Found ${widgets.length} widgets`)
    
    if (widgets.length > 0) {
      console.log('First widget:', widgets[0].name)
    }

    // 3. Create a new widget
    console.log('\n3. Creating a new widget...')
    const newWidget = await client.widgets.create({
      name: 'Customer Support Bot',
      companyId: 'company-123',
      theme: 'light',
      primaryColor: '#007bff'
    })
    console.log('✓ Created widget:', newWidget.name)
    console.log('  Widget Key:', newWidget.widgetKey)

    // 4. Send a test message
    console.log('\n4. Sending a test message...')
    const chatResponse = await client.chat.sendMessage({
      message: 'Hello, I need help with my order',
      widgetKey: newWidget.widgetKey,
      userId: 'test-user-123'
    })
    console.log('✓ Bot response:', chatResponse.response)
    console.log('  Tokens used:', chatResponse.tokens)

    // 5. Get analytics
    console.log('\n5. Getting analytics...')
    const analytics = await client.analytics.get('7d', newWidget.id)
    console.log('✓ Analytics for last 7 days:')
    console.log('  Total messages:', analytics.totalMessages)
    console.log('  Total users:', analytics.totalUsers)
    console.log('  Average satisfaction:', analytics.avgSatisfaction)

    // 6. Create a webhook
    console.log('\n6. Creating a webhook...')
    const webhook = await client.webhooks.create({
      name: 'Message Notification',
      url: 'https://example.com/webhook',
      events: ['message.created', 'chat.completed']
    })
    console.log('✓ Created webhook:', webhook.name)
    console.log('  Webhook URL:', webhook.url)

    // 7. Upload knowledge base
    console.log('\n7. Uploading knowledge base content...')
    const kbText = `
# Frequently Asked Questions

## What are your business hours?
We are open Monday to Friday, 9 AM to 6 PM EST.

## How can I track my order?
You can track your order using the tracking number sent to your email.

## What is your return policy?
We offer a 30-day return policy for all items in original condition.
    `.trim()
    
    const kb = await client.knowledgeBase.uploadText(kbText, 'FAQ Document')
    console.log('✓ Uploaded knowledge base:', kb.name)
    console.log('  Status:', kb.status)

    // 8. Cleanup - Delete the test widget
    console.log('\n8. Cleaning up...')
    await client.widgets.delete(newWidget.id)
    console.log('✓ Deleted test widget')

    console.log('\n✅ All examples completed successfully!')

  } catch (error) {
    console.error('Error:', error.message)
  }
}

// Run the examples
main()