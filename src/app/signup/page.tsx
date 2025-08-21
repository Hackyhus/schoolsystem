import { School } from 'lucide-react';
import { SignUpForm } from '@/components/auth/signup-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 font-body">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
           <div className="mx-auto mb-4 inline-block rounded-full bg-primary p-4 text-primary-foreground">
            <School className="h-8 w-8" />
          </div>
          <CardTitle className="font-headline text-3xl text-primary">
            Create an Account
          </CardTitle>
          <CardDescription>
            Enter your details to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />
        </CardContent>
        <CardFooter>
           <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Button variant="link" asChild className="p-0">
              <Link href="/">
                Sign In
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
