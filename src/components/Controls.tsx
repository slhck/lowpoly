import { Settings as SettingsIcon, X, Download } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { ColourControls } from '@/components/controls/ColourControls';
import { DimensionControls } from '@/components/controls/DimensionControls';
import { GeometryControls } from '@/components/controls/GeometryControls';
import { ImageControls } from '@/components/controls/ImageControls';
import { PaletteControls } from '@/components/controls/PaletteControls';
import { RenderingControls } from '@/components/controls/RenderingControls';
import { cn } from '@/lib/utils';
import { useSettings } from '@/store/settings';

const PNG_PREFIX = 'data:image/png;base64,';
const SVG_PREFIX = 'data:image/svg+xml;charset=utf-8,';

const formatSize = (bytes: number): string => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes.toFixed(0)} B`;
};

const pngSize = (dataUrl: string): number =>
  dataUrl ? Math.round(((dataUrl.length - PNG_PREFIX.length) * 3) / 4) : 0;

const svgSize = (dataUrl: string): number =>
  dataUrl ? decodeURIComponent(dataUrl.slice(SVG_PREFIX.length)).length : 0;

export function Controls({ output }: { output: { png: string; svg: string } }) {
  const settings = useSettings();
  const [open, setOpen] = useState(false);
  const { width, height } = settings.dimensions;

  return (
    <>
      <Button
        variant="default"
        size="icon"
        className={cn(
          'fixed bottom-6 right-6 z-30 size-14 rounded-full shadow-2xl shadow-brand-primary-darker/40 md:hidden',
          open && 'right-[21rem]',
        )}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close controls' : 'Open controls'}
      >
        {open ? <X className="size-6" /> : <SettingsIcon className="size-6" />}
      </Button>

      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-20 flex w-80 max-w-[calc(100vw-2.5rem)] flex-col overflow-y-auto bg-card shadow-2xl shadow-brand-primary-darker/20 transition-transform duration-300 ease-in-out',
          'md:translate-x-0',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <Header />

        <div className="flex-1">
          <DimensionControls />
          <ImageControls />
          <GeometryControls />
          <ColourControls />
          <PaletteControls />
          <RenderingControls />

          <section className="space-y-2 border-b border-border bg-brand-old-white/40 px-4 py-3">
            <h3 className="text-xs font-bold uppercase tracking-wide text-foreground/80">
              Export
            </h3>
            <Button asChild className="w-full" disabled={!output.png}>
              <a href={output.png || '#'} download="lowpoly.png">
                <Download className="size-4" />
                Download PNG
              </a>
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              {formatSize(pngSize(output.png))} • {width} × {height}
            </p>
            <Button asChild variant="secondary" className="w-full" disabled={!output.svg}>
              <a href={output.svg || '#'} download="lowpoly.svg">
                <Download className="size-4" />
                Download SVG
              </a>
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              {formatSize(svgSize(output.svg))} • {width} × {height}
            </p>
          </section>
        </div>

        <footer className="px-5 py-4 text-center text-xs text-muted-foreground">
          <a href="https://github.com/slhck/lowpoly" target="_blank" rel="noopener noreferrer">
            Source Code
          </a>
        </footer>
      </aside>
    </>
  );
}
