'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AddUserForm } from '@/components/dashboard/users/add-user-form';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import type { MockUser } from '@/lib/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function UsersPage() {
  const [users, setUsers] = useState<MockUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersList = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as MockUser)
      );
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch users.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const removeUser = async (userId: string) => {
     if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      // Note: This does not delete the user from Firebase Auth, only Firestore.
      // A more robust solution would use a Cloud Function to delete the Auth user.
      await deleteDoc(doc(db, 'users', userId));
      toast({
        title: 'User Removed',
        description: 'The user has been successfully deleted from the list.',
      });
      fetchUsers(); // Refresh the list
    } catch (error) {
       console.error('Error removing user:', error);
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not remove the user.',
      });
    }
  };

  // This function is passed to the form, but the form now handles user creation directly.
  // We keep it to refresh the user list.
  const handleUserAdded = () => {
    fetchUsers();
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage staff and parent accounts.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>A list of all users in the system.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                       <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 inline-block" /></TableCell>
                      </TableRow>
                    ))
                  ) : users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono">{user.staffId}</TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                       <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeUser(user.id.toString())}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && users.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No users found. Add a user to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add New User</CardTitle>
              <CardDescription>
                Create a new account for a staff member or parent.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddUserForm onUserAdded={handleUserAdded} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}