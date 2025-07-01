'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/app/_components/common/PageHeader';
import { InviteUserModal } from '@/app/_components/feature/users/InviteUserModal';

export default function InviteUserPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;

  return (
    <div className="container mx-auto py-6">
      <PageHeader title="ユーザー招待" description="新しいユーザーを組織に招待します" />

      <div className="max-w-2xl mx-auto mt-8">
        <InviteUserModal
          orgId={orgId}
          onSuccess={() => router.push(`/admin/${orgId}/users`)}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}
