import type { FieldDefinition, Point2D } from "./types";

/**
 * Converts between "field space" (inches, origin at field center, +Y up —
 * see types.ts header) and "canvas space" (pixels, origin at top-left, +Y
 * down) for whatever <canvas>/SVG viewport is rendering the field editor.
 */
export function fieldToCanvas(
  point: Point2D,
  field: Pick<FieldDefinition, "width" | "height">,
  canvasSizePx: { width: number; height: number }
): Point2D {
  const scaleX = canvasSizePx.width / field.width;
  const scaleY = canvasSizePx.height / field.height;
  return {
    x: canvasSizePx.width / 2 + point.x * scaleX,
    y: canvasSizePx.height / 2 - point.y * scaleY, // flip Y
  };
}

export function canvasToField(
  point: Point2D,
  field: Pick<FieldDefinition, "width" | "height">,
  canvasSizePx: { width: number; height: number }
): Point2D {
  const scaleX = field.width / canvasSizePx.width;
  const scaleY = field.height / canvasSizePx.height;
  return {
    x: (point.x - canvasSizePx.width / 2) * scaleX,
    y: (canvasSizePx.height / 2 - point.y) * scaleY, // flip Y
  };
}

export function distance(a: Point2D, b: Point2D): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** Snap a field-space point to the nearest tile intersection. */
export function snapToTileGrid(point: Point2D, tileSize: number): Point2D {
  return {
    x: Math.round(point.x / tileSize) * tileSize,
    y: Math.round(point.y / tileSize) * tileSize,
  };
}

/** Normalize a heading in degrees to the range [0, 360). */
export function normalizeHeading(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

/** Shortest signed angular difference (degrees) from `from` to `to`, in (-180, 180]. */
export function headingDelta(from: number, to: number): number {
  let diff = normalizeHeading(to) - normalizeHeading(from);
  if (diff > 180) diff -= 360;
  if (diff <= -180) diff += 360;
  return diff;
}
