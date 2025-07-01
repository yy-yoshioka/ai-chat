'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/app/_components/common/PageHeader';
import { UserDetailView } from '@/app/_components/feature/users/UserDetailView';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;
  const userId = params.userId as string;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          戻る
        </Button>

        <PageHeader title="ユーザー詳細" description="ユーザー情報と権限の管理" />
      </div>

      <UserDetailView userId={userId} orgId={orgId} />
    </div>
  );
}
