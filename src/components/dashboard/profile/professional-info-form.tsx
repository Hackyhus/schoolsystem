
'use client';

import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { MockUser } from '@/lib/schema';

interface ProfessionalInfoFormProps {
    userData: MockUser;
}

export function ProfessionalInfoForm({ userData }: ProfessionalInfoFormProps) {

    const formattedEmploymentDate = userData.employmentDate
        ? format(new Date(userData.employmentDate.seconds * 1000), 'PPP')
        : 'N/A';
    
    const formattedDob = userData.personalInfo?.dob
        ? format(new Date(userData.personalInfo.dob.seconds * 1000), 'PPP')
        : 'N/A';

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Staff ID</Label>
                    <Input value={userData.staffId || ''} readOnly disabled />
                </div>
                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={userData.email || ''} readOnly disabled />
                </div>
                 <div className="space-y-2">
                    <Label>Role</Label>
                    <Input value={userData.role || ''} readOnly disabled />
                </div>
                 <div className="space-y-2">
                    <Label>Department</Label>
                    <Input value={userData.department || ''} readOnly disabled />
                </div>
                <div className="space-y-2">
                    <Label>Date of Employment</Label>
                    <Input value={formattedEmploymentDate} readOnly disabled />
                </div>
                <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input value={formattedDob} readOnly disabled />
                </div>
                 <div className="space-y-2">
                    <Label>Gender</Label>
                    <Input value={userData.personalInfo?.gender || ''} readOnly disabled />
                </div>
                 <div className="space-y-2">
                    <Label>State of Origin</Label>
                    <Input value={userData.stateOfOrigin || ''} readOnly disabled />
                </div>
            </div>
        </div>
    );
}
