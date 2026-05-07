import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ControlGroup } from '@/components/ControlGroup';
import { hslToCss, randomBrightHex, hexToHsl } from '@/lib/colour';
import type { HSLColour } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useDispatchSettings, useSettings } from '@/store/settings';

const MAX_COLOURS = 12;

export function ColourControls() {
  const { colour } = useSettings();
  const dispatch = useDispatchSettings();
  const [active, setActive] = useState(0);
  const [local, setLocal] = useState<HSLColour[]>(colour);

  useEffect(() => {
    setLocal(colour);
    if (active >= colour.length) setActive(colour.length - 1);
  }, [colour, active]);

  const commit = (next: HSLColour[]) => {
    setLocal(next);
    dispatch({ type: 'SET_COLOURS', payload: next });
  };

  const handleAdd = () => {
    if (local.length >= MAX_COLOURS) return;
    commit([...local, hexToHsl(randomBrightHex())]);
  };

  const handleRemove = () => {
    if (local.length <= 1) return;
    const next = local.filter((_, i) => i !== active);
    setActive(Math.min(active, next.length - 1));
    commit(next);
  };

  const updateChannel = (channel: 0 | 1 | 2, value: number) => {
    const next = local.map((c, i) => {
      if (i !== active) return c;
      const copy: [number, number, number] = [...c];
      copy[channel] = value;
      return copy as HSLColour;
    });
    setLocal(next);
  };

  const commitChannel = () => {
    dispatch({ type: 'SET_COLOURS', payload: local });
  };

  const activeColour = local[active] ?? [0, 0, 50];
  const [h, s, l] = activeColour;

  const hueGradient = `linear-gradient(to right, ${[0, 60, 120, 180, 240, 300, 360]
    .map((hh) => `hsl(${hh}, ${s}%, ${l}%)`)
    .join(',')})`;
  const satGradient = `linear-gradient(to right, hsl(${h}, 0%, ${l}%), hsl(${h}, 100%, ${l}%))`;
  const lumGradient = `linear-gradient(to right, hsl(${h}, ${s}%, 0%), hsl(${h}, ${s}%, 50%), hsl(${h}, ${s}%, 100%))`;

  return (
    <ControlGroup title="Colours">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={handleAdd}
          disabled={local.length >= MAX_COLOURS}
        >
          <Plus className="size-3.5" />
          Add
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleRemove}
          disabled={local.length <= 1}
        >
          <Trash2 className="size-3.5" />
          Remove
        </Button>
      </div>

      <div className="flex h-9 overflow-hidden rounded-md ring-1 ring-border">
        {local.map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Colour ${i + 1}`}
            className={cn(
              'flex-1 cursor-pointer outline-none transition-transform',
              active === i && local.length > 1 && 'ring-2 ring-brand-primary z-10 scale-y-110',
            )}
            style={{ backgroundColor: hslToCss(c) }}
          />
        ))}
      </div>

      <div className="space-y-3">
        <ChannelSlider
          label="Hue"
          value={h}
          max={360}
          gradient={hueGradient}
          onChange={(v) => updateChannel(0, v)}
          onCommit={commitChannel}
        />
        <ChannelSlider
          label="Saturation"
          value={s}
          max={100}
          gradient={satGradient}
          onChange={(v) => updateChannel(1, v)}
          onCommit={commitChannel}
        />
        <ChannelSlider
          label="Luminosity"
          value={l}
          max={100}
          gradient={lumGradient}
          onChange={(v) => updateChannel(2, v)}
          onCommit={commitChannel}
        />
      </div>
    </ControlGroup>
  );
}

function ChannelSlider({
  label,
  value,
  max,
  gradient,
  onChange,
  onCommit,
}: {
  label: string;
  value: number;
  max: number;
  gradient: string;
  onChange: (v: number) => void;
  onCommit: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-xs font-mono tabular-nums text-muted-foreground">{value}</span>
      </div>
      <div className="relative h-5 rounded-full" style={{ background: gradient }}>
        <Slider
          min={0}
          max={max}
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          onValueCommit={onCommit}
          className="absolute inset-0 [&_[data-slot=slider-track]]:bg-transparent [&_[data-slot=slider-range]]:bg-transparent"
        />
      </div>
    </div>
  );
}
