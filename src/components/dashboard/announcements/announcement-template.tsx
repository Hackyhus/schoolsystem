
'use client';

import type { Announcement, SchoolInfo } from '@/lib/schema';
import Image from 'next/image';
import { format } from 'date-fns';

interface AnnouncementTemplateProps {
  announcement: Announcement;
  schoolInfo: SchoolInfo | null;
}

export function AnnouncementTemplate({ announcement, schoolInfo }: AnnouncementTemplateProps) {
  const announcementDate = announcement.createdAt?.seconds 
    ? format(new Date(announcement.createdAt.seconds * 1000), 'PPP') 
    : 'N/A';
  
  const formatContent = (content: string) => {
    return content
      .split('\n')
      .filter(line => line.trim() !== '')
      .map((line, index) => `<p key=${index}>${line}</p>`)
      .join('');
  };

  return (
    <div id="printable-area">
      <div id="pdf-content" className="max-w-4xl mx-auto p-8 bg-white text-black font-serif">
        <header className="text-center border-b-2 border-gray-300 pb-4">
          {schoolInfo?.logoUrl && (
            <div className="flex justify-center mb-4">
              <Image 
                src={schoolInfo.logoUrl} 
                alt={`${schoolInfo.name} Logo`} 
                width={200} 
                height={50} 
                className="h-20 w-auto object-contain"
              />
            </div>
          )}
          <h1 className="text-4xl font-bold text-primary">{schoolInfo?.name || 'School Announcement'}</h1>
          <p className="text-sm text-gray-600 mt-1">{schoolInfo?.address}</p>
          <p className="text-xs text-gray-500">Phone: {schoolInfo?.phone} | Email: {schoolInfo?.email}</p>
        </header>

        <main className="py-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold uppercase tracking-wider underline">Public Announcement</h2>
          </div>

          <div className="flex justify-between items-baseline mb-8 text-sm">
            <span><strong>Ref:</strong> GIIA/ANNC/{announcement.id.substring(0, 5).toUpperCase()}</span>
            <span><strong>Date:</strong> {announcementDate}</span>
          </div>
          
          <div className="space-y-4 text-base leading-relaxed">
            <h3 className="text-xl font-bold text-center mb-4">{announcement.title}</h3>
            
            <div 
              className="whitespace-pre-wrap text-justify space-y-4"
              dangerouslySetInnerHTML={{ __html: formatContent(announcement.content) }}
            />
          </div>

          <div className="mt-16 text-right">
             <p className="font-semibold">{announcement.authorName}</p>
             <p className="text-sm text-gray-700">For: Management</p>
          </div>
        </main>
      </div>
    </div>
  );
}
