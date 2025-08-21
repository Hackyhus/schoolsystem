import { School } from 'lucide-react';
import { LoginForm } from '@/components/auth/login-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 font-body">
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
      </Card>
    </main>
  );
}
