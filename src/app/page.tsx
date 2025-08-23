
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRole } from '@/context/role-context';

export default function Home() {
  const { role, isLoading } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && role) {
      router.push('/dashboard');
    }
  }, [role, isLoading, router]);
  
  if (isLoading || role) {
    return (
       <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
         {/* You can add a loader here if you want */}
       </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/school-background.jpg')" }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20 backdrop-blur-sm"></div>
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center bg-transparent p-4 font-body">
        <Card className="w-full max-w-sm shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Image
                src="/school-logo.png"
                alt="Great Insight International Academy Logo"
                width={250}
                height={60}
              />
            </div>
            <CardDescription>
              Great Insight International Academy Portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button variant="link" asChild className="p-0 text-sm">
              <Link href="/forgot-password">Forgot Password?</Link>
            </Button>
            <Button
              variant="link"
              asChild
              className="text-xs text-muted-foreground hover:text-muted-foreground/80"
            >
              <Link href="/admin/login">Admin Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
