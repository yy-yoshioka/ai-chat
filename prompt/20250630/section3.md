# Section-3: Conversation Analytics & Unresolved Questions
`<todo-key>: analytics-base`

## 🎯 目的
会話フロー分析と未解決質問の可視化機能を実装

## 📋 作業内容

### 1. Express APIルート実装（analytics.tsに追加）
```typescript
// ai-chat/src/routes/analytics.ts に追加
import { authMiddleware } from '../middleware/auth';
import { organizationAccessMiddleware } from '../middleware/organizationAccess';
import prisma from '../lib/prisma';

// 会話フロー分析
router.get(
  '/analytics/conversation-flow',
  authMiddleware,
  organizationAccessMiddleware,
  async (req, res, next) => {
    try {
      const { widgetId, startDate, endDate } = req.query;
      
      // 会話の遷移パターンを集計
      const flows = await prisma.$queryRaw<any[]>`
        WITH message_pairs AS (
          SELECT 
            m1.id as from_id,
            m1.content as from_content,
            m1.role as from_role,
            m2.id as to_id,
            m2.content as to_content,
            m2.role as to_role,
            m1.chat_id
          FROM messages m1
          JOIN messages m2 ON m1.chat_id = m2.chat_id 
            AND m2.created_at = (
              SELECT MIN(created_at) 
              FROM messages 
              WHERE chat_id = m1.chat_id 
              AND created_at > m1.created_at
            )
          JOIN chats c ON m1.chat_id = c.id
          WHERE c.widget_id = ${widgetId}::uuid
          ${startDate ? `AND m1.created_at >= ${new Date(startDate as string)}` : ''}
          ${endDate ? `AND m1.created_at <= ${new Date(endDate as string)}` : ''}
        )
        SELECT 
          from_content as source,
          to_content as target,
          COUNT(*) as value
        FROM message_pairs
        GROUP BY from_content, to_content
        ORDER BY value DESC
        LIMIT 50
      `;
      
      // Sankey diagram用のデータ形式に変換
      const nodes = new Set<string>();
      const links: any[] = [];
      
      flows.forEach((flow: any) => {
        // 長いメッセージは省略
        const source = flow.source.substring(0, 50) + (flow.source.length > 50 ? '...' : '');
        const target = flow.target.substring(0, 50) + (flow.target.length > 50 ? '...' : '');
        
        nodes.add(source);
        nodes.add(target);
        links.push({
          source,
          target,
          value: Number(flow.value)
        });
      });
      
      res.json({
        nodes: Array.from(nodes).map((label, index) => ({ 
          id: index, 
          label 
        })),
        links
      });
    } catch (error) {
      next(error);
    }
  }
);

// 未解決質問の取得
router.get(
  '/analytics/unresolved',
  authMiddleware,
  organizationAccessMiddleware,
  async (req, res, next) => {
    try {
      const { widgetId, limit = 50 } = req.query;
      
      // 低評価または未回答の質問を取得
      const unresolvedMessages = await prisma.message.findMany({
        where: {
          chat: { 
            widgetId: widgetId as string,
            organizationId: req.organizationId
          },
          role: 'user',
          OR: [
            {
              // 否定的フィードバックがある
              feedback: {
                some: { helpful: false }
              }
            },
            {
              // AIが回答できなかった（特定のキーワードを含む）
              chat: {
                messages: {
                  some: {
                    role: 'assistant',
                    OR: [
                      { content: { contains: 'お答えできません' } },
                      { content: { contains: 'わかりません' } },
                      { content: { contains: '申し訳ございません' } }
                    ]
                  }
                }
              }
            }
          ]
        },
        include: {
          feedback: {
            where: { helpful: false },
            select: {
              feedback: true,
              createdAt: true
            }
          },
          chat: {
            include: {
              messages: {
                where: { role: 'assistant' },
                orderBy: { createdAt: 'asc' },
                take: 1
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit)
      });
      
      // 類似質問のグルーピング
      const groupedQuestions = await groupSimilarQuestions(unresolvedMessages);
      
      res.json({ 
        questions: groupedQuestions,
        total: unresolvedMessages.length
      });
    } catch (error) {
      next(error);
    }
  }
);

// 類似質問のグルーピング関数
async function groupSimilarQuestions(messages: any[]) {
  // 簡易的な実装（本来はベクトル類似度などを使用）
  const groups: Map<string, any[]> = new Map();
  
  messages.forEach(message => {
    // 最初の10文字をキーとして簡易グルーピング
    const key = message.content.substring(0, 20).toLowerCase();
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    
    groups.get(key)!.push(message);
  });
  
  // グループを配列に変換
  return Array.from(groups.entries()).map(([key, messages]) => ({
    pattern: messages[0].content,
    count: messages.length,
    examples: messages.slice(0, 3),
    firstOccurrence: messages[messages.length - 1].createdAt,
    lastOccurrence: messages[0].createdAt
  }));
}
```

### 2. BFFルート実装
```typescript
// ai-chat-ui/app/api/bff/analytics/conversation-flow/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE_URL } from '@/app/_config';

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const response = await fetch(
      `${API_BASE_URL}/analytics/conversation-flow?${queryString}`,
      {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Conversation flow analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
```

### 3. 会話フロー可視化コンポーネント
```typescript
// ai-chat-ui/app/_components/feature/analytics/ConversationFlowChart.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConversationFlow } from '@/_hooks/analytics/useAnalytics';

interface ConversationFlowChartProps {
  widgetId: string;
  dateRange: { start: Date; end: Date };
}

export function ConversationFlowChart({ 
  widgetId, 
  dateRange 
}: ConversationFlowChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { data, isLoading, isError } = useConversationFlow(widgetId, dateRange);
  
  useEffect(() => {
    if (!data || !svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    
    // Clear previous chart
    svg.selectAll('*').remove();
    
    // Create Sankey generator
    const sankeyGenerator = sankey()
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]]);
    
    // Prepare data
    const sankeyData = {
      nodes: data.nodes.map(d => ({ ...d })),
      links: data.links.map(d => ({ ...d }))
    };
    
    // Generate Sankey diagram
    const { nodes, links } = sankeyGenerator(sankeyData);
    
    // Color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    
    // Add links
    svg.append('g')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', d => color(d.source.label))
      .attr('stroke-width', d => Math.max(1, d.width))
      .attr('fill', 'none')
      .attr('opacity', 0.5)
      .append('title')
      .text(d => `${d.source.label} → ${d.target.label}\n${d.value} 回`);
    
    // Add nodes
    svg.append('g')
      .selectAll('rect')
      .data(nodes)
      .join('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('height', d => d.y1 - d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('fill', d => color(d.label))
      .append('title')
      .text(d => `${d.label}\n${d.value} 回`);
    
    // Add labels
    svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('x', d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr('y', d => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => d.x0 < width / 2 ? 'start' : 'end')
      .text(d => d.label)
      .style('font-size', '12px');
      
  }, [data]);
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-gray-500">読み込み中...</div>
        </CardContent>
      </Card>
    );
  }
  
  if (isError) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-red-500">データの読み込みに失敗しました</div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>会話フロー分析</CardTitle>
      </CardHeader>
      <CardContent>
        <svg
          ref={svgRef}
          width={800}
          height={600}
          className="w-full h-auto"
          viewBox={`0 0 800 600`}
          preserveAspectRatio="xMidYMid meet"
        />
      </CardContent>
    </Card>
  );
}
```

### 4. 未解決質問コンポーネント
```typescript
// ai-chat-ui/app/_components/feature/analytics/UnresolvedQuestions.tsx
'use client';

import React, { useState } from 'react';
import { AlertCircle, MessageSquare, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useUnresolvedQuestions } from '@/_hooks/analytics/useAnalytics';
import { useToast } from '@/components/ui/use-toast';

interface UnresolvedQuestionsProps {
  widgetId: string;
}

export function UnresolvedQuestions({ widgetId }: UnresolvedQuestionsProps) {
  const { questions, isLoading, mutate } = useUnresolvedQuestions(widgetId);
  const { toast } = useToast();
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  
  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedGroups(newExpanded);
  };
  
  const addToFAQ = async (pattern: string) => {
    try {
      // FAQ追加のAPI呼び出し
      const response = await fetch('/api/bff/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widgetId,
          question: pattern,
          answer: '（回答を入力してください）',
          category: '未分類'
        })
      });
      
      if (!response.ok) throw new Error('Failed to add FAQ');
      
      toast({
        title: 'FAQに追加しました',
        description: '回答を編集してください',
      });
      
      mutate();
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'FAQの追加に失敗しました',
        variant: 'destructive',
      });
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-gray-500">読み込み中...</div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          未解決の質問
        </CardTitle>
      </CardHeader>
      <CardContent>
        {questions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            未解決の質問はありません
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((group, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {group.count}回
                      </Badge>
                      <span className="text-sm text-gray-500">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        最終: {formatDistanceToNow(new Date(group.lastOccurrence), {
                          addSuffix: true,
                          locale: ja
                        })}
                      </span>
                    </div>
                    
                    <p className="font-medium text-gray-900 mb-2">
                      {group.pattern}
                    </p>
                    
                    {expandedGroups.has(index) && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm text-gray-600">類似の質問:</p>
                        {group.examples.slice(1).map((example, i) => (
                          <div key={i} className="pl-4 border-l-2 border-gray-200">
                            <p className="text-sm text-gray-700">{example.content}</p>
                            {example.feedback?.[0]?.feedback && (
                              <p className="text-xs text-gray-500 mt-1">
                                フィードバック: {example.feedback[0].feedback}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {group.count > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(index)}
                      >
                        {expandedGroups.has(index) ? '閉じる' : '詳細'}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => addToFAQ(group.pattern)}
                    >
                      FAQに追加
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### 5. Analytics Hook実装
```typescript
// ai-chat-ui/app/_hooks/analytics/useAnalytics.ts
import useSWR from 'swr';
import { fetchGet } from '@/_utils/fetcher';

export function useConversationFlow(
  widgetId: string,
  dateRange: { start: Date; end: Date }
) {
  const params = new URLSearchParams({
    widgetId,
    startDate: dateRange.start.toISOString(),
    endDate: dateRange.end.toISOString()
  });
  
  const { data, error } = useSWR(
    `/api/bff/analytics/conversation-flow?${params}`,
    fetchGet
  );
  
  return {
    data,
    isLoading: !error && !data,
    isError: error
  };
}

export function useUnresolvedQuestions(widgetId: string, limit = 50) {
  const { data, error, mutate } = useSWR(
    `/api/bff/analytics/unresolved?widgetId=${widgetId}&limit=${limit}`,
    fetchGet
  );
  
  return {
    questions: data?.questions || [],
    total: data?.total || 0,
    isLoading: !error && !data,
    isError: error,
    mutate
  };
}
```

### 6. ダッシュボードページへの統合
```typescript
// ai-chat-ui/app/(org)/admin/[orgId]/analytics/page.tsx
'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { ConversationFlowChart } from '@/_components/feature/analytics/ConversationFlowChart';
import { UnresolvedQuestions } from '@/_components/feature/analytics/UnresolvedQuestions';
import { PageHeader } from '@/_components/common/PageHeader';
import { useWidgets } from '@/_hooks/widgets/useWidgets';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AnalyticsPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const { widgets } = useWidgets(orgId);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30日前
    end: new Date()
  });
  
  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="高度な分析"
        description="会話パターンと改善ポイントの分析"
      />
      
      <div className="flex items-center gap-4 mt-6 mb-4">
        <Select value={selectedWidgetId} onValueChange={setSelectedWidgetId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="ウィジェットを選択" />
          </SelectTrigger>
          <SelectContent>
            {widgets.map((widget) => (
              <SelectItem key={widget.id} value={widget.id}>
                {widget.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />
      </div>
      
      {selectedWidgetId && (
        <Tabs defaultValue="flow" className="mt-6">
          <TabsList>
            <TabsTrigger value="flow">会話フロー</TabsTrigger>
            <TabsTrigger value="unresolved">未解決質問</TabsTrigger>
          </TabsList>
          
          <TabsContent value="flow" className="mt-4">
            <ConversationFlowChart
              widgetId={selectedWidgetId}
              dateRange={dateRange}
            />
          </TabsContent>
          
          <TabsContent value="unresolved" className="mt-4">
            <UnresolvedQuestions widgetId={selectedWidgetId} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
```

## ✅ 完了条件
- [ ] 会話フローがSankeyダイアグラムで表示される
- [ ] 未解決質問がグルーピングされて表示される
- [ ] FAQへの追加機能が動作する
- [ ] 日付範囲の絞り込みが機能する

## 🚨 注意事項
- D3.jsのバージョン互換性
- 大量データ時のパフォーマンス
- グルーピングアルゴリズムの精度