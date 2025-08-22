'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RolesPermissionsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-headline text-3xl font-bold">Roles & Permissions</h1>
                <p className="text-muted-foreground">
                    Manage user roles and what they can access within the portal.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        This section is under construction. You will be able to manage role permissions here.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>A matrix of roles and permissions will be available here for configuration.</p>
                </CardContent>
            </Card>
        </div>
    );
}
