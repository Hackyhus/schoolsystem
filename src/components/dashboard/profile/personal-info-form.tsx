
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { MockUser } from '@/lib/schema';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useState } from 'react';

const formSchema = z.object({
    address: z.string().min(1, 'Address is required.'),
    phone: z.string().min(1, 'Phone number is required.'),
    nextOfKin: z.string().optional(),
    profilePicture: z.instanceof(FileList).optional(),
});

type PersonalInfoFormValues = z.infer<typeof formSchema>;

interface PersonalInfoFormProps {
    userData: MockUser;
    onUpdate: (data: Partial<MockUser>) => void;
}

export function PersonalInfoForm({ userData, onUpdate }: PersonalInfoFormProps) {
    const { toast } = useToast();
    const [imagePreview, setImagePreview] = useState<string | null>(userData.personalInfo?.profilePicture || null);
    const fileRef = React.useRef<HTMLInputElement>(null);

    const form = useForm<PersonalInfoFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            address: userData.personalInfo?.address || '',
            phone: userData.phone || '',
            nextOfKin: userData.personalInfo?.nextOfKin || '',
        }
    });

    const onSubmit = async (values: PersonalInfoFormValues) => {
        try {
            const userDocRef = doc(db, 'users', userData.id);
            let downloadURL = userData.personalInfo?.profilePicture || null;
            const file = values.profilePicture?.[0];

            if (file) {
                 const storageRef = ref(storage, `profile-pictures/${userData.id}/${file.name}`);
                 const uploadResult = await uploadBytes(storageRef, file);
                 downloadURL = await getDownloadURL(uploadResult.ref);
            }

            const updatedData = {
                'phone': values.phone,
                'personalInfo.address': values.address,
                'personalInfo.nextOfKin': values.nextOfKin,
                'personalInfo.profilePicture': downloadURL,
            };
            await updateDoc(userDocRef, updatedData);

            onUpdate({ phone: values.phone, personalInfo: { ...userData.personalInfo, address: values.address, nextOfKin: values.nextOfKin || null, profilePicture: downloadURL } });
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
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={imagePreview || ''} alt={userData.name} />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                     <FormField
                        control={form.control}
                        name="profilePicture"
                        render={({ field }) => (
                            <FormItem className="w-full flex-1">
                            <FormLabel>Change Profile Picture</FormLabel>
                            <FormControl>
                                <Input 
                                 type="file" 
                                 accept="image/*"
                                 ref={fileRef}
                                 onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setImagePreview(URL.createObjectURL(file));
                                    }
                                    field.onChange(e.target.files)
                                 }}
                                />
                            </FormControl>
                             <FormDescription>Select a new image to upload.</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                        name="nextOfKin"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Next of Kin (Full Name, Relationship, Phone)</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Jane Doe, Sister, 080..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                                <FormLabel>Home Address</FormLabel>
                                <FormControl>
                                    <Textarea {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
