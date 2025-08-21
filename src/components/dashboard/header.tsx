
'use client';
import { Bell, ChevronDown, User as UserIcon, LogOut, Moon, Sun } from 'lucide-react';
import {
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRole } from '@/context/role-context';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/theme-context';
import Link from 'next/link';
import { NotificationBell } from './notifications/notification-bell';

export function DashboardHeader() {
  const { role, logout } = useRole();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 1) return 'Dashboard';
    const title = segments[segments.length-1].replace(/-/g, ' ');
    return title.charAt(0).toUpperCase() + title.slice(1);
  };

  const userInitials = role ? role.substring(0, 2).toUpperCase() : '..';

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <SidebarTrigger />
      <h1 className="hidden font-headline text-xl font-semibold md:block">{getPageTitle()}</h1>
      <div className="ml-auto flex items-center gap-2">
        <NotificationBell />
         <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 rounded-full px-2 py-1"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://placehold.co/40x40.png" alt={role ?? ''} data-ai-hint="person portrait" />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline">{role}</span>
              <ChevronDown className="hidden h-4 w-4 md:inline" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
             <Link href="/profile" passHref>
                <DropdownMenuItem>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </DropdownMenuItem>
             </Link>
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
