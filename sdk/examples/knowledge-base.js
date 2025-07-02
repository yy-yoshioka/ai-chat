const AIChatSDK = require('@ai-chat/sdk').default
const fs = require('fs')
const path = require('path')

// Initialize the SDK
const client = new AIChatSDK({
  apiKey: process.env.AI_CHAT_API_KEY,
  baseURL: process.env.AI_CHAT_API_URL || 'https://api.ai-chat.com/v1'
})

/**
 * Example: Knowledge Base Management
 */
async function knowledgeBaseExample() {
  try {
    console.log('📚 Knowledge Base Management Example\n')
    
    // 1. Upload text content
    console.log('1. Uploading text content...')
    const textContent = `
# Product Documentation

## Getting Started
Our product is designed to help you manage customer support efficiently.

### Key Features
- AI-powered chat responses
- Multi-language support
- Analytics dashboard
- Integration with popular CRM systems

## Installation Guide
1. Sign up for an account at https://ai-chat.com
2. Create your first widget
3. Copy the embed code
4. Paste it into your website's HTML

## API Documentation
Our RESTful API allows you to:
- Create and manage widgets programmatically
- Send and receive messages
- Access analytics data
- Configure webhooks

For detailed API documentation, visit https://docs.ai-chat.com
    `.trim()
    
    const textKB = await client.knowledgeBase.uploadText(
      textContent,
      'Product Documentation'
    )
    console.log('✓ Uploaded text knowledge base:', textKB.name)
    console.log('  Status:', textKB.status)
    console.log('  ID:', textKB.id)
    
    // 2. Upload from URL
    console.log('\n2. Uploading content from URL...')
    const urlKB = await client.knowledgeBase.uploadFromURL(
      'https://example.com/help-docs.pdf',
      'External Help Documentation'
    )
    console.log('✓ Uploaded URL knowledge base:', urlKB.name)
    console.log('  Source:', urlKB.source)
    
    // 3. Upload a file (simulated)
    console.log('\n3. Uploading a file...')
    // In a real scenario, you would read a file from disk
    const fileContent = Buffer.from('Sample FAQ content for testing', 'utf-8')
    const formData = new FormData()
    formData.append('file', new Blob([fileContent]), 'faq.txt')
    formData.append('name', 'FAQ Document')
    formData.append('type', 'file')
    
    const fileKB = await client.knowledgeBase.upload(formData)
    console.log('✓ Uploaded file knowledge base:', fileKB.name)
    
    // 4. List all knowledge bases
    console.log('\n4. Listing all knowledge bases...')
    const allKBs = await client.knowledgeBase.list()
    console.log(`✓ Found ${allKBs.length} knowledge bases:`)
    allKBs.forEach(kb => {
      console.log(`  - ${kb.name} (${kb.type}) - Status: ${kb.status}`)
    })
    
    // 5. Check processing status
    console.log('\n5. Checking processing status...')
    let processingComplete = false
    let attempts = 0
    const maxAttempts = 10
    
    while (!processingComplete && attempts < maxAttempts) {
      const status = await client.knowledgeBase.getStatus(textKB.id)
      console.log(`  Status: ${status.status}${status.progress ? ` (${status.progress}%)` : ''}`)
      
      if (status.status === 'completed' || status.status === 'failed') {
        processingComplete = true
      } else {
        // Wait 2 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
      attempts++
    }
    
    // 6. Get detailed information
    console.log('\n6. Getting detailed KB information...')
    const kbDetails = await client.knowledgeBase.get(textKB.id)
    console.log('✓ Knowledge base details:')
    console.log('  Name:', kbDetails.name)
    console.log('  Type:', kbDetails.type)
    console.log('  Status:', kbDetails.status)
    console.log('  Chunks:', kbDetails.chunks || 'N/A')
    console.log('  Created:', new Date(kbDetails.createdAt).toLocaleString())
    
    // 7. Handle errors
    console.log('\n7. Testing error handling...')
    try {
      await client.knowledgeBase.get('invalid-id')
    } catch (error) {
      console.log('✓ Error handled correctly:', error.message)
    }
    
    // 8. Reprocess a knowledge base
    if (kbDetails.status === 'failed') {
      console.log('\n8. Reprocessing failed knowledge base...')
      const reprocessed = await client.knowledgeBase.reprocess(kbDetails.id)
      console.log('✓ Reprocessing initiated:', reprocessed.status)
    }
    
    // 9. Clean up - Delete test knowledge bases
    console.log('\n9. Cleaning up test data...')
    for (const kb of [textKB, urlKB, fileKB]) {
      if (kb && kb.id) {
        await client.knowledgeBase.delete(kb.id)
        console.log(`✓ Deleted: ${kb.name}`)
      }
    }
    
    console.log('\n✅ Knowledge base examples completed!')
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

/**
 * Example: Bulk upload from directory
 */
async function bulkUploadExample() {
  try {
    console.log('\n📁 Bulk Upload Example\n')
    
    const docsDir = './docs' // Your documentation directory
    
    if (!fs.existsSync(docsDir)) {
      console.log('Docs directory not found. Skipping bulk upload example.')
      return
    }
    
    const files = fs.readdirSync(docsDir)
      .filter(file => file.endsWith('.md') || file.endsWith('.txt'))
    
    console.log(`Found ${files.length} files to upload`)
    
    const uploadPromises = files.map(async (filename) => {
      const filePath = path.join(docsDir, filename)
      const content = fs.readFileSync(filePath, 'utf-8')
      const name = path.basename(filename, path.extname(filename))
      
      try {
        const kb = await client.knowledgeBase.uploadText(content, name)
        console.log(`✓ Uploaded: ${name}`)
        return kb
      } catch (error) {
        console.error(`✗ Failed to upload ${name}:`, error.message)
        return null
      }
    })
    
    const results = await Promise.all(uploadPromises)
    const successful = results.filter(r => r !== null)
    
    console.log(`\nBulk upload complete: ${successful.length}/${files.length} successful`)
    
  } catch (error) {
    console.error('Bulk upload error:', error.message)
  }
}

// Run examples
async function main() {
  await knowledgeBaseExample()
  // Uncomment to run bulk upload example
  // await bulkUploadExample()
}

main()