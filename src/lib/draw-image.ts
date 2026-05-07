/**
 * Draws an image into a canvas with `background-size: cover` semantics.
 * Adapted from Ken Fyrstenberg Nilsen's `drawImageProp`.
 */
export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  offX = 0.5,
  offY = 0.5,
): void {
  const x = 0;
  const y = 0;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const offsetX = Math.min(Math.max(offX, 0), 1);
  const offsetY = Math.min(Math.max(offY, 0), 1);

  const iw = img.width;
  const ih = img.height;
  const r = Math.min(w / iw, h / ih);

  let nw = iw * r;
  let nh = ih * r;

  let ar = 1;
  if (nw < w) ar = w / nw;
  if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;
  nw *= ar;
  nh *= ar;

  const cw = iw / (nw / w);
  const ch = ih / (nh / h);
  let cx = (iw - cw) * offsetX;
  let cy = (ih - ch) * offsetY;

  if (cx < 0) cx = 0;
  if (cy < 0) cy = 0;

  ctx.drawImage(
    img,
    cx,
    cy,
    Math.min(cw, iw),
    Math.min(ch, ih),
    x,
    y,
    w,
    h,
  );
}
