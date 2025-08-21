import { redirect } from 'next/navigation';

export default function SignUpPage() {
  // This page is deprecated in favor of the admin-led user creation flow.
  // Redirect users to the main login page.
  redirect('/');
}