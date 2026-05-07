import { useCallback, useEffect, useRef, useState } from 'react';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ControlGroup } from '@/components/ControlGroup';
import type { RenderingSettings } from '@/lib/types';
import { useDispatchSettings, useSettings } from '@/store/settings';

type FieldKey = Exclude<keyof RenderingSettings, 'gradientAngle'>;

const fields: { key: FieldKey; label: string; max: number; description: string }[] = [
  {
    key: 'shadingStrength',
    label: 'Shading strength',
    max: 30,
    description: 'How much per-triangle shading is applied. Higher = more 3D depth, but back-facing triangles can stick out.',
  },
  {
    key: 'paletteCompression',
    label: 'Palette compression',
    max: 100,
    description: 'Pulls palette colours toward their average luminance. Reduces contrast between gradient stops.',
  },
  {
    key: 'darkLift',
    label: 'Dark lift',
    max: 100,
    description: 'Lifts darker sampled background pixels toward the mean. Helps prevent isolated dark patches.',
  },
];

export function RenderingControls() {
  const settings = useSettings();
  const dispatch = useDispatchSettings();
  const [local, setLocal] = useState(settings.rendering);

  useEffect(() => {
    setLocal(settings.rendering);
  }, [settings.rendering]);

  const handleChange = (key: keyof RenderingSettings, value: number) => {
    setLocal({ ...local, [key]: value });
  };

  const handleCommit = (key: keyof RenderingSettings, value: number) => {
    dispatch({ type: 'SET_RENDERING', payload: { option: key, value } });
  };

  return (
    <ControlGroup title="Shading & Background" defaultOpen={false}>
      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor={f.key}>{f.label}</Label>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {local[f.key]}
                {f.max === 100 ? '%' : ''}
              </span>
            </div>
            <Slider
              id={f.key}
              min={0}
              max={f.max}
              value={[local[f.key]]}
              onValueChange={([v]) => handleChange(f.key, v)}
              onValueCommit={([v]) => handleCommit(f.key, v)}
            />
            <p className="text-[11px] leading-snug text-muted-foreground">{f.description}</p>
          </div>
        ))}

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label>Gradient angle</Label>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {local.gradientAngle}°
            </span>
          </div>
          <div className="flex items-center gap-3">
            <AngleDial
              value={local.gradientAngle}
              onChange={(v) => handleChange('gradientAngle', v)}
              onCommit={(v) => handleCommit('gradientAngle', v)}
            />
            <p className="flex-1 text-[11px] leading-snug text-muted-foreground">
              Direction the background gradient flows. Drag the dial or click to set a direction.
            </p>
          </div>
        </div>
      </div>
    </ControlGroup>
  );
}

function AngleDial({
  value,
  onChange,
  onCommit,
}: {
  value: number;
  onChange: (v: number) => void;
  onCommit: (v: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const valueRef = useRef(value);
  valueRef.current = value;

  const angleFromPointer = useCallback((clientX: number, clientY: number): number => {
    if (!ref.current) return valueRef.current;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (deg < 0) deg += 360;
    return Math.round(deg);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => {
      onChange(angleFromPointer(e.clientX, e.clientY));
    };
    const up = (e: PointerEvent) => {
      setDragging(false);
      onCommit(angleFromPointer(e.clientX, e.clientY));
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [dragging, angleFromPointer, onChange, onCommit]);

  const rad = ((value - 90) * Math.PI) / 180;
  const handleX = 50 + 38 * Math.cos(rad);
  const handleY = 50 + 38 * Math.sin(rad);

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label="Gradient angle"
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={value}
      className="relative size-16 shrink-0 cursor-pointer rounded-full bg-background ring-1 ring-border select-none"
      onPointerDown={(e) => {
        e.preventDefault();
        ref.current?.focus();
        const next = angleFromPointer(e.clientX, e.clientY);
        onChange(next);
        setDragging(true);
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          e.preventDefault();
          const next = (value - 5 + 360) % 360;
          onChange(next);
          onCommit(next);
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          e.preventDefault();
          const next = (value + 5) % 360;
          onChange(next);
          onCommit(next);
        }
      }}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-0.5 origin-left bg-foreground/40"
        style={{
          width: '38%',
          transform: `translateY(-50%) rotate(${value - 90}deg)`,
        }}
      />
      <div
        className="pointer-events-none absolute size-2.5 rounded-full bg-brand-primary ring-2 ring-background"
        style={{
          left: `calc(${handleX}% - 5px)`,
          top: `calc(${handleY}% - 5px)`,
        }}
      />
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/40" />
    </div>
  );
}
