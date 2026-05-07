import { Loader2 } from 'lucide-react';

export function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
      <Loader2 className="size-12 animate-spin text-brand-primary-lightest" strokeWidth={2.5} />
    </div>
  );
}
