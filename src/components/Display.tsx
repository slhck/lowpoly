import { useEffect, useRef, useState } from 'react';

import { Loader } from './Loader';
import { Lowpoly } from '@/lib/lowpoly';
import { useSettings } from '@/store/settings';

type Output = { png: string; svg: string };

export function Display({ onOutput }: { onOutput: (output: Output) => void }) {
  const settings = useSettings();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Lowpoly | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      engineRef.current = new Lowpoly(canvasRef.current);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
  }, [settings]);

  useEffect(() => {
    if (!loading) return;
    let cancelled = false;
    (async () => {
      const engine = engineRef.current;
      if (!engine) return;
      const output = await engine.render({
        variance: settings.geometry.variance,
        cellSize: settings.geometry.cellSize,
        depth: settings.geometry.depth,
        dither: settings.geometry.dither,
        shadingStrength: settings.rendering.shadingStrength,
        paletteCompression: settings.rendering.paletteCompression,
        darkLift: settings.rendering.darkLift,
        gradientAngle: settings.rendering.gradientAngle,
        image: settings.image,
        colours: settings.colour,
        useImage: settings.useImage,
        seed: settings.seed,
      });
      if (cancelled) return;
      onOutput(output);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, settings, onOutput]);

  const { width, height } = settings.dimensions;

  return (
    <div className="relative flex h-full w-full items-center justify-center p-4 md:p-8 lg:p-12">
      {loading ? <Loader /> : null}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="max-h-full max-w-full rounded-lg shadow-2xl shadow-brand-primary-darker/20"
      />
    </div>
  );
}
