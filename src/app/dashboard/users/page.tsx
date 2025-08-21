
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
import { AddUserForm } from '@/components/dashboard/users/add-user-form';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, deleteDoc, doc, query, where, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { MockUser } from '@/lib/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function UsersPage() {
  const [users, setUsers] = useState<MockUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const usersRef = collection(db, 'users');
      // Query for users that have a staffId. We will filter out the admin client-side.
      const q = query(usersRef, where('staffId', '!=', null));
      const querySnapshot = await getDocs(q);
      const usersList = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as MockUser))
        .filter((user) => user.role !== 'Admin'); // Filter out Admins on the client
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

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { role: newRole });
      toast({
        title: 'Role Updated',
        description: `The user's role has been successfully updated to ${newRole}.`,
      });
      fetchUsers(); // Refresh the list to show the new role
    } catch (error) {
       console.error('Error updating role:', error);
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update the user role.',
      });
    }
  };


  const removeUser = async (userId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this user? This action cannot be undone.'
      )
    )
      return;
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

  const handleUserAdded = () => {
    fetchUsers();
    setIsModalOpen(false); // Close the modal
  };

  const availableRoles = ['Principal', 'Director', 'HeadOfDepartment', 'Teacher', 'Accountant', 'ExamOfficer', 'Parent', 'Student'];


  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage staff and parent accounts.
        </p>
      </div>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              A list of all non-admin users in the system.
            </CardDescription>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Staff</DialogTitle>
                <DialogDescription>
                  Create a new account for a staff member. The default password is their State of Origin.
                </DialogDescription>
              </DialogHeader>
              <AddUserForm onUserAdded={handleUserAdded} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-36" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 inline-block" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono">{user.staffId || 'N/A'}</TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                       <Select
                        value={user.role}
                        onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                       >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableRoles.map(role => (
                               <SelectItem key={role} value={role}>{role}</SelectItem>
                            ))}
                        </SelectContent>
                       </Select>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeUser(user.id.toString())}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
  );
}
