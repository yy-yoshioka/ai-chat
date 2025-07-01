'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchPost } from '@/app/_utils/fetcher';

export default function VerifyEmailPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    verifyEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const verifyEmail = async () => {
    try {
      await fetchPost('/api/bff/auth/verify-email', { token });

      setStatus('success');
      setMessage('メールアドレスが確認されました');

      // 3秒後にログインページへリダイレクト
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch {
      setStatus('error');
      setMessage('メールアドレスの確認に失敗しました');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                確認中...
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                確認完了
              </>
            )}
            {status === 'error' && (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                エラー
              </>
            )}
          </CardTitle>
          <CardDescription className="text-center">{message}</CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'success' && (
            <p className="text-center text-sm text-gray-600">
              ログインページにリダイレクトします...
            </p>
          )}
          {status === 'error' && (
            <div className="space-y-4">
              <p className="text-center text-sm text-gray-600">
                リンクの有効期限が切れているか、すでに使用されている可能性があります。
              </p>
              <Button onClick={() => router.push('/login')} className="w-full">
                ログインページへ
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
