import { School } from 'lucide-react';
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

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 font-body">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 inline-block rounded-full bg-primary p-4 text-primary-foreground">
            <School className="h-8 w-8" />
          </div>
          <CardTitle className="font-headline text-3xl text-primary">
            InsightConnect
          </CardTitle>
          <CardDescription>
            Great Insight International Academy Portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter className="flex-col gap-4">
           <Button variant="link" asChild className="p-0 text-sm">
              <Link href="/forgot-password">
                Forgot Password?
              </Link>
            </Button>
            <Button variant="link" asChild className="text-xs text-muted-foreground">
              <Link href="/admin/login">
                Admin Login
              </Link>
            </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
