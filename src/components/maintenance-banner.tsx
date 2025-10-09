'use client';

import { useMaintenance } from '@/context/maintenance-context';
import { Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MaintenanceBanner() {
  const { isMaintenanceMode, isLoading } = useMaintenance();

  if (isLoading || !isMaintenanceMode) {
    return null;
  }

  return (
    <div className={cn(
        "bg-yellow-500 text-yellow-900",
        "flex items-center justify-center p-2 text-sm font-semibold text-center"
    )}>
      <Wrench className="mr-2 h-4 w-4" />
      <span>Maintenance Mode is Active. Some features are temporarily disabled.</span>
    </div>
  );
}
