import { Dices } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ControlGroup } from '@/components/ControlGroup';
import type { GeometrySettings } from '@/lib/types';
import { useDispatchSettings, useSettings } from '@/store/settings';

const fields: { key: keyof GeometrySettings; label: string; max: number }[] = [
  { key: 'variance', label: 'Variance', max: 100 },
  { key: 'cellSize', label: 'Cell size', max: 100 },
  { key: 'depth', label: 'Depth', max: 100 },
  { key: 'dither', label: 'Dither', max: 100 },
];

export function GeometryControls() {
  const settings = useSettings();
  const dispatch = useDispatchSettings();
  const [local, setLocal] = useState(settings.geometry);

  useEffect(() => {
    setLocal(settings.geometry);
  }, [settings.geometry]);

  const handleChange = (key: keyof GeometrySettings, value: number) => {
    setLocal({ ...local, [key]: value });
  };

  const handleCommit = (key: keyof GeometrySettings, value: number) => {
    dispatch({ type: 'SET_GEOMETRY', payload: { option: key, value } });
  };

  return (
    <ControlGroup title="Geometry">
      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={f.key}>{f.label}</Label>
              <span className="text-xs font-mono tabular-nums text-muted-foreground">
                {local[f.key]}
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
          </div>
        ))}
      </div>
      <Button
        variant="secondary"
        className="w-full"
        onClick={() => dispatch({ type: 'NEW_SEED', payload: Math.random() * 2147483646 })}
      >
        <Dices className="size-4" />
        Random seed
      </Button>
    </ControlGroup>
  );
}
