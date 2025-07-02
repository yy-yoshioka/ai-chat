const AIChatSDK = require('@ai-chat/sdk').default
const fs = require('fs')

// Initialize the SDK
const client = new AIChatSDK({
  apiKey: process.env.AI_CHAT_API_KEY,
  baseURL: process.env.AI_CHAT_API_URL || 'https://api.ai-chat.com/v1'
})

/**
 * Example: Analytics and Reporting
 */
async function analyticsExample() {
  try {
    console.log('📊 Analytics and Reporting Example\n')
    
    // Get a widget to use for examples
    const { widgets } = await client.widgets.list({ limit: 1 })
    if (widgets.length === 0) {
      console.log('No widgets found. Please create a widget first.')
      return
    }
    
    const widgetId = widgets[0].id
    console.log(`Using widget: ${widgets[0].name}\n`)
    
    // 1. Basic analytics
    console.log('1. Getting basic analytics...')
    const basicAnalytics = await client.analytics.get('7d', widgetId)
    console.log('✓ Analytics for last 7 days:')
    console.log('  Total messages:', basicAnalytics.totalMessages)
    console.log('  Total users:', basicAnalytics.totalUsers)
    console.log('  Average satisfaction:', basicAnalytics.avgSatisfaction.toFixed(2))
    console.log('  Response time:', basicAnalytics.responseTime.toFixed(2), 'ms')
    
    // 2. Detailed analytics
    console.log('\n2. Getting detailed analytics...')
    const detailed = await client.analytics.getDetailed('30d', widgetId)
    console.log('✓ Detailed analytics for last 30 days:')
    
    // Top questions
    console.log('\n  Top Questions:')
    detailed.topQuestions.slice(0, 5).forEach((q, i) => {
      console.log(`    ${i + 1}. "${q.question}" (${q.count} times)`)
    })
    
    // User satisfaction breakdown
    console.log('\n  User Satisfaction:')
    const total = detailed.userSatisfaction.positive + 
                  detailed.userSatisfaction.negative + 
                  detailed.userSatisfaction.neutral
    console.log(`    😊 Positive: ${detailed.userSatisfaction.positive} (${(detailed.userSatisfaction.positive/total*100).toFixed(1)}%)`)
    console.log(`    😐 Neutral: ${detailed.userSatisfaction.neutral} (${(detailed.userSatisfaction.neutral/total*100).toFixed(1)}%)`)
    console.log(`    😞 Negative: ${detailed.userSatisfaction.negative} (${(detailed.userSatisfaction.negative/total*100).toFixed(1)}%)`)
    
    // Peak hours
    console.log('\n  Peak Hours (UTC):')
    const sortedHours = detailed.peakHours.sort((a, b) => b.count - a.count).slice(0, 5)
    sortedHours.forEach(h => {
      console.log(`    ${h.hour}:00 - ${h.count} messages`)
    })
    
    // 3. Conversation flow analysis
    console.log('\n3. Analyzing conversation flow...')
    const flow = await client.analytics.getConversationFlow(widgetId, '7d')
    console.log('✓ Conversation flow analysis:')
    console.log(`  Total nodes: ${flow.nodes.length}`)
    console.log(`  Total paths: ${flow.edges.length}`)
    
    // Find most common conversation paths
    const topPaths = flow.edges.sort((a, b) => b.count - a.count).slice(0, 3)
    console.log('\n  Most common conversation paths:')
    topPaths.forEach(edge => {
      const sourceNode = flow.nodes.find(n => n.id === edge.source)
      const targetNode = flow.nodes.find(n => n.id === edge.target)
      console.log(`    "${sourceNode?.label}" → "${targetNode?.label}" (${edge.count} times)`)
    })
    
    // 4. Unresolved questions
    console.log('\n4. Finding unresolved questions...')
    const unresolved = await client.analytics.getUnresolvedQuestions(widgetId, 10)
    console.log(`✓ Found ${unresolved.length} unresolved questions:`)
    unresolved.slice(0, 5).forEach((q, i) => {
      console.log(`  ${i + 1}. "${q.question}" (asked ${q.count} times)`)
      console.log(`     Last asked: ${new Date(q.lastAsked).toLocaleString()}`)
    })
    
    // 5. Usage metrics
    console.log('\n5. Checking usage metrics...')
    const usage = await client.analytics.getUsageMetrics()
    console.log('✓ Current usage:')
    console.log(`  Messages: ${usage.messagesUsed}/${usage.messagesLimit} (${(usage.messagesUsed/usage.messagesLimit*100).toFixed(1)}%)`)
    console.log(`  Storage: ${(usage.storageUsed/1024/1024).toFixed(2)}MB/${(usage.storageLimit/1024/1024).toFixed(0)}MB`)
    console.log(`  Period: ${usage.period}`)
    
    // 6. Export reports
    console.log('\n6. Exporting analytics reports...')
    
    // Export as JSON
    const jsonReport = await client.analytics.exportReport('json', '30d', widgetId)
    fs.writeFileSync('analytics-report.json', jsonReport)
    console.log('✓ Exported JSON report to analytics-report.json')
    
    // Export as CSV (if needed, convert blob to text)
    try {
      const csvReport = await client.analytics.exportReport('csv', '30d', widgetId)
      // In a real scenario, you'd handle the blob properly
      console.log('✓ CSV report available for download')
    } catch (error) {
      console.log('  CSV export example (would download in browser)')
    }
    
    // 7. Custom date range analytics
    console.log('\n7. Custom date range analytics...')
    const customAnalytics = await client.analytics.get('24h', widgetId)
    console.log('✓ Last 24 hours:')
    console.log('  Messages:', customAnalytics.totalMessages)
    console.log('  Active users:', customAnalytics.totalUsers)
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

/**
 * Example: Building a dashboard
 */
async function dashboardExample() {
  try {
    console.log('\n📈 Dashboard Data Example\n')
    
    // Fetch all data needed for a dashboard
    const [widgets, analytics7d, analytics30d, unresolved] = await Promise.all([
      client.widgets.list(),
      client.analytics.get('7d'),
      client.analytics.get('30d'),
      client.analytics.getUnresolvedQuestions(undefined, 5)
    ])
    
    console.log('=== AI Chat Dashboard ===\n')
    
    // Widget summary
    console.log(`Widgets: ${widgets.widgets.length} active`)
    widgets.widgets.forEach(w => {
      console.log(`  • ${w.name} (${w.isActive ? '🟢 Active' : '🔴 Inactive'})`)
    })
    
    // Performance metrics
    console.log('\nPerformance (7 days vs 30 days):')
    console.log(`  Messages: ${analytics7d.totalMessages} vs ${analytics30d.totalMessages}`)
    console.log(`  Users: ${analytics7d.totalUsers} vs ${analytics30d.totalUsers}`)
    console.log(`  Avg Response Time: ${analytics7d.responseTime.toFixed(0)}ms vs ${analytics30d.responseTime.toFixed(0)}ms`)
    
    // Calculate trends
    const messagesTrend = ((analytics7d.totalMessages / 7) - (analytics30d.totalMessages / 30)) / (analytics30d.totalMessages / 30) * 100
    console.log(`  Message volume trend: ${messagesTrend > 0 ? '📈' : '📉'} ${Math.abs(messagesTrend).toFixed(1)}%`)
    
    // Unresolved questions alert
    if (unresolved.length > 0) {
      console.log('\n⚠️  Unresolved Questions:')
      unresolved.forEach(q => {
        console.log(`  • "${q.question}" (${q.count} occurrences)`)
      })
    }
    
    // Health check
    console.log('\n🏥 System Health:')
    const health = analytics7d.responseTime < 1000 ? '🟢 Healthy' : 
                   analytics7d.responseTime < 2000 ? '🟡 Degraded' : '🔴 Slow'
    console.log(`  Status: ${health}`)
    console.log(`  Uptime: 99.9%`) // This would come from a real health endpoint
    
  } catch (error) {
    console.error('Dashboard error:', error.message)
  }
}

/**
 * Example: Automated reporting
 */
async function automatedReportExample() {
  console.log('\n📧 Automated Report Example\n')
  
  // Function to generate a weekly report
  async function generateWeeklyReport() {
    const report = {
      generatedAt: new Date().toISOString(),
      period: 'Weekly Report',
      metrics: {},
      insights: []
    }
    
    try {
      // Gather data
      const analytics = await client.analytics.getDetailed('7d')
      const unresolved = await client.analytics.getUnresolvedQuestions(undefined, 10)
      const usage = await client.analytics.getUsageMetrics()
      
      // Populate report
      report.metrics = {
        totalMessages: analytics.totalMessages,
        totalUsers: analytics.totalUsers,
        avgSatisfaction: analytics.avgSatisfaction,
        responseTime: analytics.responseTime,
        satisfactionBreakdown: analytics.userSatisfaction
      }
      
      // Generate insights
      if (analytics.avgSatisfaction < 3.5) {
        report.insights.push('⚠️ User satisfaction is below target (3.5/5.0)')
      }
      
      if (analytics.responseTime > 2000) {
        report.insights.push('⚠️ Response time is high - consider optimizing')
      }
      
      if (unresolved.length > 5) {
        report.insights.push(`📝 ${unresolved.length} unresolved questions need attention`)
      }
      
      if (usage.messagesUsed / usage.messagesLimit > 0.8) {
        report.insights.push('📊 Approaching message limit (80%+ used)')
      }
      
      // Top performing topics
      const topTopics = analytics.topQuestions.slice(0, 3).map(q => q.question)
      report.insights.push(`🎯 Top topics: ${topTopics.join(', ')}`)
      
      // Format and display report
      console.log('=' .repeat(50))
      console.log('WEEKLY ANALYTICS REPORT')
      console.log('=' .repeat(50))
      console.log(`Generated: ${new Date(report.generatedAt).toLocaleString()}`)
      console.log('\nKEY METRICS:')
      console.log(`• Messages: ${report.metrics.totalMessages}`)
      console.log(`• Users: ${report.metrics.totalUsers}`)
      console.log(`• Satisfaction: ${report.metrics.avgSatisfaction.toFixed(2)}/5.0`)
      console.log(`• Response Time: ${report.metrics.responseTime.toFixed(0)}ms`)
      console.log('\nINSIGHTS:')
      report.insights.forEach(insight => console.log(insight))
      console.log('=' .repeat(50))
      
      return report
      
    } catch (error) {
      console.error('Failed to generate report:', error.message)
      return null
    }
  }
  
  await generateWeeklyReport()
}

// Run all examples
async function main() {
  await analyticsExample()
  await dashboardExample()
  await automatedReportExample()
}

main()