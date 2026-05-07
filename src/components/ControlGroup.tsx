import { ChevronDown } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

export function ControlGroup({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-b border-border">
      <CollapsibleTrigger
        className={cn(
          'flex w-full items-center justify-between px-4 py-2 text-left text-xs font-bold uppercase tracking-wide text-foreground/80 transition-colors hover:bg-brand-primary-lightest/40',
          open && 'text-brand-primary',
        )}
      >
        {title}
        <ChevronDown
          className={cn('size-3.5 transition-transform', open ? 'rotate-180' : 'rotate-0')}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="collapsible-content overflow-hidden">
        <div className="space-y-3 bg-brand-old-white/40 px-4 py-3">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
