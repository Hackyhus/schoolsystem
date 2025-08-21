
'use client';

import { AdminProfileView } from '@/components/dashboard/profile/admin-profile-view';
import { useRole } from '@/context/role-context';

export default function ProfilePage() {
    const { user, isLoading } = useRole();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <div>Please log in to view your profile.</div>;
    }

    return (
       <div className="mx-auto my-8 w-full max-w-6xl">
         <AdminProfileView userId={user.uid} />
       </div>
    );
}
