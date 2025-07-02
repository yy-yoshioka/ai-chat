const AIChatSDK = require('@ai-chat/sdk').default

// Initialize the SDK
const client = new AIChatSDK({
  apiKey: process.env.AI_CHAT_API_KEY,
  baseURL: process.env.AI_CHAT_API_URL || 'https://api.ai-chat.com/v1'
})

/**
 * Example: Building a chat widget integration
 */
async function chatWidgetExample() {
  const widgetKey = process.env.WIDGET_KEY || 'your-widget-key'
  
  try {
    // Simulate a conversation
    console.log('🤖 Chat Widget Example\n')
    
    const conversation = [
      "Hello, I'm looking for information about your pricing",
      "Can you tell me about the enterprise plan?",
      "What payment methods do you accept?",
      "Thank you for the information!"
    ]
    
    let userId = `user-${Date.now()}`
    
    for (const message of conversation) {
      console.log(`👤 User: ${message}`)
      
      // Send message to the bot
      const response = await client.chat.sendMessage({
        message,
        widgetKey,
        userId
      })
      
      console.log(`🤖 Bot: ${response.response}`)
      console.log(`   (Tokens used: ${response.tokens})`)
      console.log()
      
      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    // Get chat history
    console.log('\n📜 Fetching chat history...')
    const history = await client.chat.getHistory(widgetKey, {
      limit: 10
    })
    
    console.log(`Found ${history.messages.length} messages in history`)
    
    // Provide feedback on a message
    if (history.messages.length > 0) {
      const lastMessage = history.messages[history.messages.length - 1]
      await client.chat.provideFeedback(lastMessage.id, 'positive')
      console.log('✓ Provided positive feedback for the last message')
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

// Widget embedding example
function getEmbedCode(widgetKey) {
  return `
<!-- AI Chat Widget -->
<script>
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://api.ai-chat.com/widget-loader/'+i+'.js';
  f.parentNode.insertBefore(j,f);
  })(window,document,'script','aiChatWidget','${widgetKey}');
</script>
<!-- End AI Chat Widget -->
  `.trim()
}

// Example: Get embed code
async function embedExample() {
  try {
    console.log('\n📋 Widget Embed Code Example\n')
    
    // Get widget details
    const { widgets } = await client.widgets.list({ limit: 1 })
    
    if (widgets.length > 0) {
      const widget = widgets[0]
      console.log(`Widget: ${widget.name}`)
      console.log(`Key: ${widget.widgetKey}`)
      console.log('\nEmbed code:')
      console.log(getEmbedCode(widget.widgetKey))
      
      // Get official embed code from API
      const { code } = await client.widgets.getEmbedCode(widget.id)
      console.log('\nOfficial embed code from API:')
      console.log(code)
    } else {
      console.log('No widgets found. Create a widget first.')
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

// Run examples
async function main() {
  await chatWidgetExample()
  await embedExample()
}

main()