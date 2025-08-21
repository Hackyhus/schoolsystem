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

export default function AdminLoginPage() {
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
                priority
              />
            </div>
            <CardTitle className="font-headline text-3xl text-primary">
              Admin Portal
            </CardTitle>
            <CardDescription>
              Please enter your administrator credentials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button variant="link" asChild className="p-0 text-sm">
              <Link href="/forgot-password">Forgot Password?</Link>
            </Button>
          </CardFooter>
        </Card>
        <div className="mt-4 text-center">
          <Button
            variant="link"
            asChild
            className="text-xs text-primary-foreground hover:text-primary-foreground/80"
          >
            <Link href="/">Return to Staff Login</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
