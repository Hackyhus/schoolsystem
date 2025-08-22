'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) {
        toast({
            title: 'App Already Installed',
            description: 'The InsightConnect Portal is already installed on your device.',
        });
        return;
    }
    
    (installPrompt as any).prompt();
    (installPrompt as any).userChoice.then((choiceResult: { outcome: 'accepted' | 'dismissed' }) => {
        if (choiceResult.outcome === 'accepted') {
            toast({
                title: 'Installation Successful',
                description: 'The app has been added to your home screen.',
            });
        }
        setInstallPrompt(null);
    });
  };


  return (
    <div className="space-y-8">
       <div>
        <h1 className="font-headline text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Install Application</CardTitle>
          <CardDescription>
            Install the InsightConnect Portal on your device for a better experience, including offline access and notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleInstallClick}>
            <Download className="mr-2 h-4 w-4" />
            Install App
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}
