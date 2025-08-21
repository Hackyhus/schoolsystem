'use client';
import { Bell, ChevronDown, User as UserIcon } from 'lucide-react';
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

export function DashboardHeader() {
  const { role, logout } = useRole();
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
      <SidebarTrigger className="md:hidden" />
      <h1 className="hidden font-headline text-xl font-semibold md:block">{getPageTitle()}</h1>
      <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
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
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
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
