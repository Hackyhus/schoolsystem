
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { MockUser } from '@/lib/schema';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const formSchema = z.object({
    address: z.string().min(1, 'Address is required.'),
    phone: z.string().min(1, 'Phone number is required.'),
    nextOfKin: z.string().optional(),
    profilePicture: z.string().url().optional().or(z.literal('')),
});

type PersonalInfoFormValues = z.infer<typeof formSchema>;

interface PersonalInfoFormProps {
    userData: MockUser;
    onUpdate: (data: Partial<MockUser>) => void;
}

export function PersonalInfoForm({ userData, onUpdate }: PersonalInfoFormProps) {
    const { toast } = useToast();
    const form = useForm<PersonalInfoFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            address: userData.personalInfo?.address || '',
            phone: userData.phone || '',
            nextOfKin: userData.personalInfo?.nextOfKin || '',
            profilePicture: userData.personalInfo?.profilePicture || '',
        }
    });

    const onSubmit = async (values: PersonalInfoFormValues) => {
        try {
            const userDocRef = doc(db, 'users', userData.id);
            const updatedData = {
                'phone': values.phone,
                'personalInfo.address': values.address,
                'personalInfo.nextOfKin': values.nextOfKin,
                'personalInfo.profilePicture': values.profilePicture,
            };
            await updateDoc(userDocRef, updatedData);

            onUpdate({ phone: values.phone, personalInfo: { ...userData.personalInfo, address: values.address, nextOfKin: values.nextOfKin || null, profilePicture: values.profilePicture || null } });
            toast({ title: 'Success', description: 'Personal information updated successfully.' });
        } catch (error) {
            console.error('Error updating profile:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update personal information.' });
        }
    };

    const userInitials = userData.name ? userData.name.split(' ').map(n => n[0]).join('') : '..';

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center gap-4">
                     <Avatar className="h-20 w-20">
                        <AvatarImage src={form.watch('profilePicture') || userData.personalInfo.profilePicture || ''} alt={userData.name} />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                     <FormField
                        control={form.control}
                        name="profilePicture"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                            <FormLabel>Profile Picture URL</FormLabel>
                            <FormControl>
                                <Input placeholder="https://example.com/your-image.png" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Home Address</FormLabel>
                            <FormControl>
                                <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="nextOfKin"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Next of Kin</FormLabel>
                            <FormControl>
                                <Input placeholder="Full Name, Relationship, Phone Number" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
