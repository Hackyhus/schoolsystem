
'use client';

import { useRole } from '@/context/role-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
    const { user, isLoading } = useRole();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        if (user?.staffId) {
            // If the user object from the context has a staffId, redirect to their profile.
            router.replace(`/dashboard/users/${user.staffId}`);
        } else if (user) {
            // If the user is logged in but is not a staff member (e.g., a parent),
            // redirect them to their dashboard as they don't have a staff profile page.
            router.replace('/dashboard');
        } else {
            // If not logged in at all, go to the login page.
            router.replace('/');
        }
    }, [isLoading, user, router]);

    // Display a loading state while redirecting to avoid a flash of unstyled content.
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="w-full max-w-lg space-y-4 p-4">
                <h2 className="text-xl font-semibold">Redirecting to your profile...</h2>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-8 w-3/4" />
                <div className="space-y-2 pt-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                </div>
            </div>
        </div>
    );
}
