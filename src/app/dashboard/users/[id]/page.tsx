'use client';

import { AdminProfileView } from '@/components/dashboard/profile/admin-profile-view';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  if (typeof id !== 'string') {
    return <div>Invalid user ID.</div>;
  }

  return (
    <div className="space-y-4">
      <Button variant="outline" onClick={() => router.push('/dashboard/users')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Users
      </Button>
      <AdminProfileView userId={id} />
    </div>
  );
}
