import { Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header
      className="border-b border-border px-6 py-5 text-white"
      style={{ backgroundImage: 'var(--gradient-deep)' }}
    >
      <div className="flex items-center gap-3">
        <Sparkles className="size-6 text-brand-primary-lightest" />
        <h1 className="text-xl font-extrabold tracking-tight">Low Poly Generator</h1>
      </div>
      <p className="mt-2 text-sm text-brand-primary-lightest/85">
        Generate low-poly backgrounds for personal and commercial use.
      </p>
    </header>
  );
}
