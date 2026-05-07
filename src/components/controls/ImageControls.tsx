import { ImagePlus } from 'lucide-react';
import { useRef, type ChangeEvent, type DragEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ControlGroup } from '@/components/ControlGroup';
import type { ImageInfo } from '@/lib/types';
import { useDispatchSettings, useSettings } from '@/store/settings';

export function ImageControls() {
  const { image, useImage } = useSettings();
  const dispatch = useDispatchSettings();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const loadFiles = (files: FileList | null) => {
    if (!files || !files[0]) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const info: NonNullable<ImageInfo> = {
          src: img.src,
          width: img.width,
          height: img.height,
        };
        dispatch({ type: 'SET_IMAGE', payload: info });
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(files[0]);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => loadFiles(e.target.files);
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    loadFiles(e.dataTransfer.files);
  };
  const handleDragOver = (e: DragEvent) => e.preventDefault();

  const resizeToImage = () => {
    if (!image) return;
    dispatch({
      type: 'SET_DIMENSIONS',
      payload: { width: image.width, height: image.height },
    });
  };

  return (
    <ControlGroup title="Image" defaultOpen={false}>
      {image && image.src ? (
        <div className="flex items-center justify-center rounded-md bg-brand-old-white p-2 ring-1 ring-border">
          <img
            src={image.src}
            alt="Preview"
            className="block max-h-44 max-w-full rounded object-contain"
          />
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-brand-primary-lighter bg-brand-primary-lightest/30 px-4 py-6 text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-primary-lightest/60"
      >
        <ImagePlus className="size-4" />
        Select or drop an image…
      </button>

      <div className="grid grid-cols-2 items-center gap-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="use-image"
            checked={useImage}
            onCheckedChange={(v) => dispatch({ type: 'SET_USE_IMAGE', payload: v === true })}
            disabled={!image}
          />
          <Label htmlFor="use-image">Use image</Label>
        </div>
        <Button variant="secondary" size="sm" onClick={resizeToImage} disabled={!image}>
          Resize to image
        </Button>
      </div>
    </ControlGroup>
  );
}
