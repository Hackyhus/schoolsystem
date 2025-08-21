import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function UsersPage() {
  return (
    <div className="space-y-8">
       <div>
        <h1 className="font-headline text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage staff and parent accounts.
        </p>
      </div>

       <Card className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-8 w-8 text-primary"/>
          </div>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>The user management interface is currently under development.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
               Admins will be able to add, edit, and manage all user accounts from here.
            </p>
        </CardContent>
       </Card>
    </div>
  );
}
