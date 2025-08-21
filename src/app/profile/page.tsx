
'use client';

import { ProfileForm } from '@/components/dashboard/profile/profile-form';
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
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">My Profile</h1>
                <p className="text-muted-foreground">
                    View and update your personal information.
                </p>
            </div>
            <ProfileForm userId={user.uid} />
        </div>
    );
}
