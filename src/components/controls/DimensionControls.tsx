import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ControlGroup } from '@/components/ControlGroup';
import { dimensionPresets } from '@/data/presets';
import { useDispatchSettings, useSettings } from '@/store/settings';

export function DimensionControls() {
  const settings = useSettings();
  const dispatch = useDispatchSettings();
  const [width, setWidth] = useState(settings.dimensions.width);
  const [height, setHeight] = useState(settings.dimensions.height);

  const handlePreset = (value: string) => {
    for (const group of Object.values(dimensionPresets)) {
      if (group[value]) {
        setWidth(group[value].width);
        setHeight(group[value].height);
        return;
      }
    }
  };

  const apply = () => {
    dispatch({ type: 'SET_DIMENSIONS', payload: { width, height } });
  };

  return (
    <ControlGroup title="Dimensions">
      <div className="space-y-2">
        <Label htmlFor="presets">Preset</Label>
        <Select onValueChange={handlePreset}>
          <SelectTrigger id="presets" className="w-full">
            <SelectValue placeholder="Select a preset…" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(dimensionPresets).map(([groupName, group]) => (
              <SelectGroup key={groupName}>
                <SelectLabel>{groupName}</SelectLabel>
                {Object.entries(group).map(([name, dim]) => (
                  <SelectItem key={name} value={name}>
                    {name} ({dim.width}×{dim.height})
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="width">Width</Label>
          <Input
            id="width"
            type="number"
            value={width}
            onChange={(e) => setWidth(parseInt(e.target.value, 10) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="height">Height</Label>
          <Input
            id="height"
            type="number"
            value={height}
            onChange={(e) => setHeight(parseInt(e.target.value, 10) || 0)}
          />
        </div>
      </div>

      <Button onClick={apply} className="w-full">
        Apply
      </Button>
    </ControlGroup>
  );
}
