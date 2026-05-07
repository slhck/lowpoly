import { ControlGroup } from '@/components/ControlGroup';
import { namedPalettes } from '@/data/palette';
import { hslToCss } from '@/lib/colour';
import type { HSLColour } from '@/lib/types';
import { useDispatchSettings } from '@/store/settings';

export function PaletteControls() {
  const dispatch = useDispatchSettings();
  return (
    <ControlGroup title="Palettes">
      <div className="-my-1 space-y-0.5">
        {namedPalettes.map((p) => (
          <PaletteRow
            key={p.name}
            name={p.name}
            colours={p.colours}
            onClick={() => dispatch({ type: 'SET_COLOURS', payload: p.colours })}
          />
        ))}
      </div>
    </ControlGroup>
  );
}

function PaletteRow({
  name,
  colours,
  onClick,
}: {
  name: string;
  colours: HSLColour[];
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-2.5 rounded p-1 transition-colors hover:bg-brand-primary-lightest/40"
    >
      <div className="flex h-5 w-28 overflow-hidden rounded-sm ring-1 ring-border">
        {colours.map((c, i) => (
          <div key={i} className="flex-1" style={{ backgroundColor: hslToCss(c) }} />
        ))}
      </div>
      <span className="text-xs font-medium text-foreground/80 group-hover:text-brand-primary">
        {name}
      </span>
    </button>
  );
}
