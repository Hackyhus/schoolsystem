
'use client';

import { AdminProfileView } from '@/components/dashboard/profile/admin-profile-view';
import { useParams } from 'next/navigation';

export default function UserProfilePage() {
    const params = useParams();
    const { id } = params;

    if (typeof id !== 'string') {
        return <div>Invalid user ID.</div>;
    }

    return (
        <AdminProfileView userId={id} />
    );
}
