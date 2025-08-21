import { cn } from '@/lib/utils';

export function SandTimer({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('animate-spin text-primary', className)}
      {...props}
    >
      <path d="M6 2v6h12V2" />
      <path d="M6 16h12" />
      <path d="m6 16 6-4 6 4" />
      <path d="m6 8 6 4 6-4" />
    </svg>
  );
}
