import { NextResponse } from 'next/server';

interface StatusUpdate {
  id: string;
  title: string;
  description: string;
  status: string;
  pubDate: string;
  link: string;
}

export async function GET() {
  // Mock data - in production, this would fetch from your database
  const statusUpdates: StatusUpdate[] = [
    {
      id: '1',
      title: 'API Response Time Degradation - Resolved',
      description:
        'The issue with slower API response times has been resolved. All systems are now operating normally.',
      status: 'resolved',
      pubDate: new Date('2024-01-15T11:45:00Z').toUTCString(),
      link: `${process.env.NEXT_PUBLIC_APP_URL}/status#incident-1`,
    },
    {
      id: '2',
      title: 'API Response Time Degradation - Monitoring',
      description:
        'We have identified the cause of slower API response times and are monitoring the system closely.',
      status: 'monitoring',
      pubDate: new Date('2024-01-15T11:00:00Z').toUTCString(),
      link: `${process.env.NEXT_PUBLIC_APP_URL}/status#incident-1`,
    },
    {
      id: '3',
      title: 'API Response Time Degradation - Investigating',
      description:
        'We are investigating reports of slower API response times. Our team is working to identify the root cause.',
      status: 'investigating',
      pubDate: new Date('2024-01-15T10:30:00Z').toUTCString(),
      link: `${process.env.NEXT_PUBLIC_APP_URL}/status#incident-1`,
    },
  ];

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com';
  const rssXml = generateRSSXML(statusUpdates, baseUrl);

  return new NextResponse(rssXml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
    },
  });
}

function generateRSSXML(statusUpdates: StatusUpdate[], baseUrl: string): string {
  const rssItems = statusUpdates
    .map(
      (update) => `
      <item>
        <title><![CDATA[${update.title}]]></title>
        <description><![CDATA[${update.description}]]></description>
        <link>${update.link}</link>
        <guid isPermaLink="false">${update.id}</guid>
        <pubDate>${update.pubDate}</pubDate>
        <category>${update.status}</category>
      </item>
    `
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>AI Chat System Status</title>
    <description>Real-time updates about AI Chat system status and incidents</description>
    <link>${baseUrl}/status</link>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>support@aichat.com (AI Chat Support)</managingEditor>
    <webMaster>tech@aichat.com (AI Chat Tech Team)</webMaster>
    <ttl>60</ttl>
    <atom:link href="${baseUrl}/api/status/rss" rel="self" type="application/rss+xml" />
    
    <image>
      <url>${baseUrl}/favicon.ico</url>
      <title>AI Chat System Status</title>
      <link>${baseUrl}/status</link>
      <width>32</width>
      <height>32</height>
    </image>
    
    ${rssItems}
  </channel>
</rss>`;
}
