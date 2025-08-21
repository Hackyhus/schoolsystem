
'use client';

import { ProfileForm } from '@/components/dashboard/profile/profile-form';
import { useParams } from 'next/navigation';

export default function UserProfilePage() {
    const params = useParams();
    const { id } = params;

    if (typeof id !== 'string') {
        return <div>Invalid user ID.</div>;
    }

    return (
         <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">Staff Profile</h1>
                <p className="text-muted-foreground">
                    Viewing details for staff member.
                </p>
            </div>
            <ProfileForm userId={id} />
        </div>
    );
}

