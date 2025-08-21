
'use client';

import { useRole } from '@/context/role-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
    const { user, isLoading, logout } = useRole();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/');
        }
    }, [isLoading, user, router]);

    if (isLoading || !user) {
        return <div>Loading...</div>;
    }

    return (
       <div className="mx-auto my-8 w-full max-w-lg">
            <Card>
                <CardHeader>
                    <CardTitle>My Profile</CardTitle>
                    <CardDescription>Basic account information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Name</p>
                        <p className="font-semibold">{user.displayName || 'Not set'}</p>
                    </div>
                     <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p className="font-semibold">{user.email}</p>
                    </div>
                    <Button onClick={logout} className="w-full">
                        Log Out
                    </Button>
                </CardContent>
            </Card>
       </div>
    );
}
