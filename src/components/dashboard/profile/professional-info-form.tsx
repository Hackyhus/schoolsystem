
'use client';

import { format } from 'date-fns';
import type { MockUser } from '@/lib/schema';
import { Card, CardContent } from '@/components/ui/card';

interface ProfessionalInfoFormProps {
    userData: MockUser;
}

const InfoItem = ({ label, value }: { label: string, value: string | undefined | null }) => (
    <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-base font-semibold">{value || 'N/A'}</p>
    </div>
)

export function ProfessionalInfoForm({ userData }: ProfessionalInfoFormProps) {

    const formattedEmploymentDate = userData.employmentDate
        ? format(new Date(userData.employmentDate.seconds * 1000), 'PPP')
        : 'N/A';
    
    const formattedDob = userData.personalInfo?.dob
        ? format(new Date(userData.personalInfo.dob.seconds * 1000), 'PPP')
        : 'N/A';

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <InfoItem label="Staff ID" value={userData.staffId} />
                    <InfoItem label="Email" value={userData.email} />
                    <InfoItem label="Role" value={userData.role} />
                    <InfoItem label="Department" value={userData.department} />
                    <InfoItem label="Date of Employment" value={formattedEmploymentDate} />
                    <InfoItem label="Date of Birth" value={formattedDob} />
                    <InfoItem label="Gender" value={userData.personalInfo?.gender} />
                    <InfoItem label="State of Origin" value={userData.stateOfOrigin} />
                </div>
            </CardContent>
        </Card>
    );
}
