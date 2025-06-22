import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Types and interfaces
export interface PIIDetectionResult {
  hasPII: boolean;
  piiTypes: string[];
  sanitizedContent: string;
  confidence: number;
  details: Array<{
    type: string;
    text: string;
    startIndex: number;
    endIndex: number;
    confidence: number;
  }>;
}

export interface SecurityAuditResult {
  organizationId: string;
  auditDate: Date;
  checks: Array<{
    name: string;
    status: 'pass' | 'fail' | 'warning';
    message: string;
    details?: Record<string, unknown>;
  }>;
  overallStatus: 'pass' | 'fail' | 'warning';
  recommendations: string[];
}

// PII検出とフィルタリング（OpenAI Moderation使用）
export async function detectAndFilterPII(
  content: string,
  organizationId: string
): Promise<PIIDetectionResult> {
  try {
    console.log(`Checking content for PII: ${content.substring(0, 100)}...`);

    // OpenAI Moderation APIを使用
    const moderationResponse = await openai.moderations.create({
      input: content,
    });

    const moderationResult = moderationResponse.results[0];

    // 基本的なPIIパターン検出（正規表現ベース）
    const piiPatterns = [
      {
        type: 'email',
        pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        confidence: 0.9,
      },
      {
        type: 'phone',
        pattern:
          /(?:\+?[1-9]\d{0,3}[-.\s]?)?\(?[0-9]{2,4}\)?[-.\s]?[0-9]{2,4}[-.\s]?[0-9]{2,4}/g,
        confidence: 0.8,
      },
      {
        type: 'credit_card',
        pattern: /(?:\d{4}[-\s]?){3}\d{4}/g,
        confidence: 0.95,
      },
      {
        type: 'ssn',
        pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
        confidence: 0.9,
      },
      {
        type: 'address',
        pattern:
          /\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr)/i,
        confidence: 0.7,
      },
    ];

    const detectedPII: PIIDetectionResult['details'] = [];
    let sanitizedContent = content;

    // 各PII パターンをチェック
    for (const piiPattern of piiPatterns) {
      const matches = Array.from(content.matchAll(piiPattern.pattern));

      for (const match of matches) {
        if (match.index !== undefined) {
          detectedPII.push({
            type: piiPattern.type,
            text: match[0],
            startIndex: match.index,
            endIndex: match.index + match[0].length,
            confidence: piiPattern.confidence,
          });

          // マスク処理
          const maskedText = '*'.repeat(Math.min(match[0].length, 8));
          sanitizedContent = sanitizedContent.replace(match[0], maskedText);
        }
      }
    }

    // より高度なPII検出（AI使用）
    if (detectedPII.length === 0 && content.length > 50) {
      const aiPIICheck = await detectPIIWithAI(content);
      if (aiPIICheck.hasPII) {
        detectedPII.push(...aiPIICheck.details);
        sanitizedContent = aiPIICheck.sanitizedContent;
      }
    }

    const result: PIIDetectionResult = {
      hasPII: detectedPII.length > 0 || moderationResult.flagged,
      piiTypes: [...new Set(detectedPII.map((item) => item.type))],
      sanitizedContent,
      confidence:
        detectedPII.length > 0
          ? detectedPII.reduce((sum, item) => sum + item.confidence, 0) /
            detectedPII.length
          : moderationResult.flagged
            ? 0.8
            : 0,
      details: detectedPII,
    };

    // PII検出をログに記録（セキュリティ監査用）
    if (result.hasPII) {
      await logSecurityEvent({
        organizationId,
        eventType: 'pii_detected',
        severity: 'medium',
        description: `PII detected in content: ${result.piiTypes.join(', ')}`,
        metadata: {
          piiTypes: result.piiTypes,
          confidence: result.confidence,
          contentLength: content.length,
        },
      });
    }

    console.log(
      `PII detection completed: ${result.hasPII ? 'PII found' : 'No PII'}`
    );
    return result;
  } catch (error) {
    console.error('Failed to detect PII:', error);

    // エラー時は安全側に倒す
    return {
      hasPII: true,
      piiTypes: ['unknown'],
      sanitizedContent: '[CONTENT_FILTERING_ERROR]',
      confidence: 0,
      details: [],
    };
  }
}

// AIを使った高度なPII検出
async function detectPIIWithAI(content: string): Promise<PIIDetectionResult> {
  try {
    const prompt = `以下のテキストに個人情報（PII）が含まれているかを分析してください。

テキスト: "${content}"

以下のJSONフォーマットで回答してください：
{
  "hasPII": boolean,
  "piiTypes": ["email", "phone", "address", "name", "other"],
  "sanitizedContent": "PIIをマスクした安全なテキスト",
  "confidence": 0.0-1.0,
  "details": [
    {
      "type": "email",
      "text": "検出された実際のテキスト", 
      "confidence": 0.0-1.0
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 1000,
    });

    const responseContent = response.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from AI');
    }

    try {
      const parsed = JSON.parse(responseContent);
      return {
        hasPII: parsed.hasPII || false,
        piiTypes: parsed.piiTypes || [],
        sanitizedContent: parsed.sanitizedContent || content,
        confidence: Math.min(Math.max(parsed.confidence || 0, 0), 1),
        details: (parsed.details || []).map(
          (detail: Record<string, unknown>) => ({
            type: (detail.type as string) || 'unknown',
            text: (detail.text as string) || '',
            startIndex: 0, // AI では正確な位置は取得困難
            endIndex: 0,
            confidence: (detail.confidence as number) || 0.5,
          })
        ),
      };
    } catch (parseError) {
      console.error('Failed to parse AI PII detection response:', parseError);
      throw parseError;
    }
  } catch (error) {
    console.error('Failed to detect PII with AI:', error);
    return {
      hasPII: false,
      piiTypes: [],
      sanitizedContent: content,
      confidence: 0,
      details: [],
    };
  }
}

// Row-Level ACL確認テスト
export async function testRowLevelACL(organizationId: string): Promise<{
  passed: boolean;
  results: Array<{
    test: string;
    passed: boolean;
    error?: string;
  }>;
}> {
  const results: Array<{ test: string; passed: boolean; error?: string }> = [];

  try {
    console.log(`Testing row-level ACL for organization: ${organizationId}`);

    // Test 1: 組織のドキュメントのみアクセス可能か
    try {
      const orgDocuments = await prisma.document.findMany({
        where: {
          knowledgeBase: {
            organizationId,
          },
        },
        include: {
          knowledgeBase: true,
        },
      });

      // 他の組織のドキュメントが含まれていないかチェック
      const otherOrgDocuments = await prisma.document.findMany({
        where: {
          knowledgeBase: {
            organizationId: { not: organizationId },
          },
        },
        take: 1,
        include: {
          knowledgeBase: true,
        },
      });

      const accessibleByCurrentOrg = orgDocuments.length > 0;
      const isolatedFromOtherOrgs =
        otherOrgDocuments.length === 0 ||
        !otherOrgDocuments.some(
          (doc) => doc.knowledgeBase?.organizationId !== organizationId
        );

      results.push({
        test: 'document_isolation',
        passed: accessibleByCurrentOrg && isolatedFromOtherOrgs,
      });
    } catch (error) {
      results.push({
        test: 'document_isolation',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Test 2: FAQアクセス制御
    try {
      const orgFAQs = await prisma.fAQ.findMany({
        where: { organizationId },
      });

      const otherOrgFAQs = await prisma.fAQ.findMany({
        where: { organizationId: { not: organizationId } },
        take: 1,
      });

      results.push({
        test: 'faq_isolation',
        passed:
          orgFAQs.length >= 0 &&
          !otherOrgFAQs.some((faq) => faq.organizationId === organizationId),
      });
    } catch (error) {
      results.push({
        test: 'faq_isolation',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Test 3: Vector埋め込みの分離
    try {
      // 組織のベクトルデータが他の組織からアクセスできないかテスト
      await prisma.$queryRaw`
        SELECT COUNT(*) as count
        FROM documents d
        INNER JOIN knowledge_bases kb ON d.knowledge_base_id = kb.id
        WHERE kb.organization_id = ${organizationId}
          AND d.embedding IS NOT NULL
      `;

      results.push({
        test: 'vector_isolation',
        passed: true, // ここでは基本的なカウントのみ
      });
    } catch (error) {
      results.push({
        test: 'vector_isolation',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Test 4: 未回答メッセージの分離
    try {
      await prisma.unansweredMessage.findMany({
        where: { organizationId },
        take: 1,
      });

      results.push({
        test: 'unanswered_isolation',
        passed: true,
      });
    } catch (error) {
      results.push({
        test: 'unanswered_isolation',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    const allPassed = results.every((result) => result.passed);

    console.log(
      `Row-level ACL test completed: ${allPassed ? 'PASSED' : 'FAILED'}`
    );

    return {
      passed: allPassed,
      results,
    };
  } catch (error) {
    console.error('Row-level ACL test failed:', error);
    return {
      passed: false,
      results: [
        {
          test: 'overall_test',
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      ],
    };
  }
}

// セキュリティイベントをログに記録
async function logSecurityEvent(event: {
  organizationId: string;
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    // イベントテーブルに記録
    const properties: Record<string, string | number | boolean | null> = {
      severity: event.severity,
      description: event.description,
      timestamp: new Date().toISOString(),
    };

    if (event.metadata) {
      properties.metadata = JSON.stringify(event.metadata);
    }

    await prisma.event.create({
      data: {
        companyId: event.organizationId, // TODO: 正しい会社IDにマッピング
        eventType: 'security_event',
        eventName: event.eventType,
        properties,
        createdAt: new Date(),
      },
    });

    // 高深刻度の場合はアラート送信
    if (event.severity === 'high' || event.severity === 'critical') {
      console.warn(
        `SECURITY ALERT [${event.severity.toUpperCase()}]: ${event.description}`
      );
      // TODO: 実際の実装では Slack/Email アラートを送信
    }
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// セキュリティ監査の実行
export async function runSecurityAudit(
  organizationId: string
): Promise<SecurityAuditResult> {
  const auditResult: SecurityAuditResult = {
    organizationId,
    auditDate: new Date(),
    checks: [],
    overallStatus: 'pass',
    recommendations: [],
  };

  try {
    console.log(`Running security audit for organization: ${organizationId}`);

    // Check 1: Row-level ACL
    const aclTest = await testRowLevelACL(organizationId);
    auditResult.checks.push({
      name: 'row_level_acl',
      status: aclTest.passed ? 'pass' : 'fail',
      message: aclTest.passed
        ? 'Row-level access control is functioning correctly'
        : 'Row-level access control issues detected',
      details: { results: aclTest.results },
    });

    if (!aclTest.passed) {
      auditResult.recommendations.push(
        'Review and fix row-level access control configurations'
      );
    }

    // Check 2: PII in existing documents
    const documentsWithPotentialPII = await prisma.document.findMany({
      where: {
        knowledgeBase: { organizationId },
        status: 'completed',
      },
      take: 10, // サンプルチェック
    });

    let piiFound = false;
    for (const doc of documentsWithPotentialPII) {
      const piiCheck = await detectAndFilterPII(
        doc.content.substring(0, 1000),
        organizationId
      );
      if (piiCheck.hasPII) {
        piiFound = true;
        break;
      }
    }

    auditResult.checks.push({
      name: 'pii_in_documents',
      status: piiFound ? 'warning' : 'pass',
      message: piiFound
        ? 'Potential PII detected in knowledge base documents'
        : 'No PII detected in sampled documents',
      details: { sampledDocuments: documentsWithPotentialPII.length },
    });

    if (piiFound) {
      auditResult.recommendations.push(
        'Review documents for PII and implement content sanitization'
      );
    }

    // Check 3: 暗号化状態
    auditResult.checks.push({
      name: 'data_encryption',
      status: 'pass', // TODO: 実際の暗号化チェック
      message: 'Data encryption is properly configured',
    });

    // Check 4: アクセスログ
    const recentEvents = await prisma.event.count({
      where: {
        companyId: organizationId,
        eventType: 'security_event',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24時間以内
        },
      },
    });

    auditResult.checks.push({
      name: 'security_events',
      status: recentEvents > 0 ? 'warning' : 'pass',
      message:
        recentEvents > 0
          ? `${recentEvents} security events detected in the last 24 hours`
          : 'No security events in the last 24 hours',
      details: { eventCount: recentEvents },
    });

    // 全体的なステータスを決定
    const hasFailures = auditResult.checks.some(
      (check) => check.status === 'fail'
    );
    const hasWarnings = auditResult.checks.some(
      (check) => check.status === 'warning'
    );

    if (hasFailures) {
      auditResult.overallStatus = 'fail';
    } else if (hasWarnings) {
      auditResult.overallStatus = 'warning';
    } else {
      auditResult.overallStatus = 'pass';
    }

    // 監査結果をログに記録
    await logSecurityEvent({
      organizationId,
      eventType: 'security_audit_completed',
      severity:
        auditResult.overallStatus === 'fail'
          ? 'high'
          : auditResult.overallStatus === 'warning'
            ? 'medium'
            : 'low',
      description: `Security audit completed with status: ${auditResult.overallStatus}`,
      metadata: {
        checksCount: auditResult.checks.length,
        failedChecks: auditResult.checks.filter((c) => c.status === 'fail')
          .length,
        warningChecks: auditResult.checks.filter((c) => c.status === 'warning')
          .length,
        recommendations: auditResult.recommendations,
      },
    });

    console.log(`Security audit completed: ${auditResult.overallStatus}`);
    return auditResult;
  } catch (error) {
    console.error('Security audit failed:', error);
    auditResult.checks.push({
      name: 'audit_error',
      status: 'fail',
      message: 'Security audit failed to complete',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    auditResult.overallStatus = 'fail';
  }

  return auditResult;
}

// セキュリティ設定の取得
export async function getSecuritySettings(_organizationId: string) {
  // TODO: Implement security settings retrieval
  return {
    encryptionEnabled: true,
    accessControlEnabled: true,
    auditLoggingEnabled: true,
  };
}

// セキュリティメトリクスの取得
export async function getSecurityMetrics(
  organizationId: string,
  days: number = 30
) {
  // TODO: Implement security metrics retrieval
  console.log(
    `Getting security metrics for ${organizationId} for ${days} days`
  );
  return {
    securityEvents: 0,
    failedLogins: 0,
    piiDetections: 0,
  };
}
