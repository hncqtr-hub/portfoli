import type { CSSProperties } from 'react';

/* The brand's decorative flower pattern.

   `01-01.png` is the source of truth for the motif and stays untouched in
   public/images. It is not used for rendering, though: its outline is a 10px
   stroke inside a 1326px artwork (0.75% of the motif's width), so at the ~28-46px
   the bands actually display it the stroke lands at 0.21-0.32 CSS px. A sub-pixel
   stroke cannot be drawn solid - the browser antialiases it to roughly a quarter
   of its alpha - which is why the pattern read as a faint pink blur rather than
   a red outline.

   ROSETTE_TILE below is that same motif traced as vectors, measured off the PNG:
   six hairpin petals at 60 degrees, flat ends outward, rounded bend inward,
   outer half-width 161.5, inner half-width 22.5, tips at radius 677.5 and bend
   centres at radius 370, all in the PNG's own 2567x2481 canvas so the spacing
   between tiles matches the asset exactly.

   The stroke is widened relative to the asset on purpose. `vector-effect:
   non-scaling-stroke` is ignored when an SVG is used as a CSS background, so the
   outline has to be specified in canvas units: STROKE_UNITS is chosen so the
   tile lands at roughly 1.5 device px on desktop and 0.9 on mobile, instead of
   the asset's own 0.3px hairline that no renderer can draw solid. */
export const ROSETTE_PATTERN_SRC = '/images/01-01.png';

/* Sampled from the PNG's opaque pixels. */
export const ROSETTE_INK = '#A51E22';

/* The golden-beige the legacy divider uses. The reference's darkest divider
   pixel is #E4D1A0 against cream; this value is set darker because at this
   band's small tile the stroke lands under a pixel wide and antialiases to
   roughly half coverage, so a literal #E4D1A0 renders washed out. */
export const ROSETTE_INK_GOLD = '#D4C28D';

const CANVAS_W = 2567;
const CANVAS_H = 2481;

/* The motif's own bounding box inside that canvas. Cropping a tile to it drops
   the asset's transparent padding, which is what holds neighbouring flowers
   apart - a tile cut to the box repeats edge to edge with no gap. */
const MOTIF_X = 621;
const MOTIF_Y = 563;
const MOTIF_W = 1326;
const MOTIF_H = 1355;
const CX = CANVAS_W / 2;
const CY = CANVAS_H / 2;
const OUTER = 161.5; // leg outer half-width
const INNER = 22.5; // half-width of the slot between the legs
const TIP = 677.5; // centre -> flat leg ends
const BEND = 370; // centre -> bend centre

/* One hairpin petal pointing up, as the outline of its silhouette. */
const PETAL = [
  `M ${CX - OUTER} ${CY - TIP}`,
  `L ${CX - OUTER} ${CY - BEND}`,
  `A ${OUTER} ${OUTER} 0 0 0 ${CX + OUTER} ${CY - BEND}`,
  `L ${CX + OUTER} ${CY - TIP}`,
  `L ${CX + INNER} ${CY - TIP}`,
  `L ${CX + INNER} ${CY - BEND}`,
  `A ${INNER} ${INNER} 0 0 1 ${CX - INNER} ${CY - BEND}`,
  `L ${CX - INNER} ${CY - TIP}`,
  'Z',
].join(' ');

/* Outline width in canvas units. At the ~84px tile the desktop bands use this
   renders near 1.5px; at the ~51px mobile tile, near 0.9px. */
const STROKE_UNITS = 40;

function rosetteTile(strokeUnits: number, ink: string, tight = false) {
  /* The tight box is padded by the stroke: a stroke straddles its path, so half
     of it sits outside the motif's geometric bounds and a box cut exactly to
     those bounds shears the outer petals off. */
  const pad = strokeUnits / 2;
  const [vx, vy, vw, vh] = tight
    ? [MOTIF_X - pad, MOTIF_Y - pad, MOTIF_W + strokeUnits, MOTIF_H + strokeUnits]
    : [0, 0, CANVAS_W, CANVAS_H];
  const petals = [0, 60, 120, 180, 240, 300]
    .map((a) => `<path d="${PETAL}" transform="rotate(${a} ${CX} ${CY})"/>`)
    .join('');
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${vw}" height="${vh}" viewBox="${vx} ${vy} ${vw} ${vh}">` +
      `<g fill="none" stroke="${ink}" stroke-width="${strokeUnits}" ` +
      `stroke-linejoin="round" shape-rendering="geometricPrecision">${petals}</g></svg>`,
  )}`;
}

/* The motif fills 1355/2481 of the tile's height; the rest is the asset's own
   transparent padding, which is what sets the gap between repeats. */
const MOTIF_HEIGHT_RATIO = 1355 / 2481;

/* A single row of flowers across a band.

   `round` is what prevents clipping: it sizes the grid to a whole number of
   columns, so neither the first nor the last flower is ever sliced. A fixed tile
   width cannot, because a band is almost never an exact multiple of the tile. */
export function rosetteBandStyle(
  fill = 0.92,
  strokeUnits = STROKE_UNITS,
  ink: string = ROSETTE_INK,
): CSSProperties {
  return {
    backgroundImage: `url("${rosetteTile(strokeUnits, ink)}")`,
    backgroundSize: `auto ${((fill / MOTIF_HEIGHT_RATIO) * 100).toFixed(1)}%`,
    /* Anchored left, not centred: a centred origin offsets the tile grid by half
       a tile and both edges show a sliced flower, the very thing `round` is here
       to prevent. */
    backgroundPosition: 'left center',
    backgroundRepeat: 'round no-repeat',
  };
}

/* The same pattern as a tiled wallpaper, for the full-bleed strips. `motif` is
   the flower's rendered height in px; the tile scales up around it. */
export function rosetteWallpaperStyle(
  motif: number,
  strokeUnits = STROKE_UNITS,
  ink: string = ROSETTE_INK,
): CSSProperties {
  const tileH = Math.round(motif / MOTIF_HEIGHT_RATIO);
  return {
    backgroundImage: `url("${rosetteTile(strokeUnits, ink)}")`,
    backgroundSize: `${Math.round(tileH * (CANVAS_W / CANVAS_H))}px ${tileH}px`,
    backgroundRepeat: 'round repeat',
  };
}

/* A seamless row of exactly `count` motifs, touching edge to edge.

   The count is fixed by the background width (100%/count) rather than left to
   `round`, and the height is 100%, so the element's own aspect ratio is what
   keeps the motif undistorted - pair it with `rosetteRowAspect(count)`.

   The stroke is lighter than the padded tile's because a tight viewBox is about
   half the canvas width, so the same canvas units would render twice as thick. */
export function rosetteBorderStyle(
  count: number,
  strokeUnits = 26,
  ink: string = ROSETTE_INK,
): CSSProperties {
  return {
    backgroundImage: `url("${rosetteTile(strokeUnits, ink, true)}")`,
    backgroundSize: `calc(100% / ${count}) auto`,
    backgroundPosition: 'center',
    backgroundRepeat: 'repeat-x',
  };
}

/* aspect-ratio for a row of `count` motifs, so the tiles never stretch. Takes
   the same stroke as rosetteBorderStyle because the tile is padded by it. */
export function rosetteRowAspect(
  count: number,
  strokeUnits = 26,
  breathe = 1.14,
): string {
  /* `breathe` leaves a little room above and below the row: the motif's petals
     end flat, so a box cut exactly to the tile makes them look shorn off against
     the edge even though nothing is actually cropped. */
  return `${count * (MOTIF_W + strokeUnits)} / ${Math.round((MOTIF_H + strokeUnits) * breathe)}`;
}

/* A single row of exactly `count` motifs drawn straight from 01-01.png.

   The count is fixed by the background width, so no `round` rescale is involved
   and nothing is ever sliced at either end; the height is `auto`, so the tile
   keeps the asset's own aspect and is never stretched. Pair it with
   `rosetteAssetRowAspect(count)` so the box is exactly one tile tall and the
   motif's own transparent padding supplies the gap between flowers - they sit
   evenly apart without touching.

   The asset is listed `passes` times because its outline is a hairline in a
   2567px canvas and lands around a third of a pixel wide at this size, which
   reads washed out - one pass covers ~39%, three ~78%.
   Compositing the identical image over itself raises that coverage; every
   channel moves in the same proportion, so the colour is the asset's own and no
   filter, tint, blend mode or opacity is applied. */
export function rosetteAssetRowStyle(count: number, passes = 3): CSSProperties {
  const src = `url('${ROSETTE_PATTERN_SRC}')`;
  return {
    backgroundImage: Array(passes).fill(src).join(', '),
    backgroundSize: `calc(100% / ${count}) auto`,
    /* Anchored left, not centred: `center` aligns the middle of a TILE with the
       middle of the box, which offsets the whole run by half a tile and leaves a
       sliced flower at each end. From the left edge the `count` tiles fill the
       box exactly. Vertically centred so the asset's padding splits evenly. */
    backgroundPosition: 'left center',
    backgroundRepeat: 'repeat-x',
  };
}

/* One tile tall for a row of `count` tiles, using the asset's real canvas. */
export function rosetteAssetRowAspect(count: number): string {
  return `${count * CANVAS_W} / ${CANVAS_H}`;
}

/* 01-01.png with its transparent padding trimmed off. That padding is what held
   neighbouring flowers apart, so the trimmed canvas - which is exactly the
   motif's bounding box - lets tiles sit flush: zero gap, and no overlap either,
   because no ink can reach outside its own tile. The original asset is untouched
   and still used wherever that padding is wanted as spacing. */
export const ROSETTE_ROW_SRC = '/images/01-01-row.png';
const ROW_W = 1326;
const ROW_H = 1355;

/* One continuous row of `count` motifs, each touching the next.

   Width is 100%/count so the run fills the box exactly and neither end is
   sliced; height is `auto`, so the asset keeps its aspect and is never
   stretched. Anchored left because `center` would align a tile's middle with the
   box's middle and leave a half flower at each end. */
export function rosetteSeamlessRowStyle(count: number, passes = 2): CSSProperties {
  const src = `url('${ROSETTE_ROW_SRC}')`;
  return {
    backgroundImage: Array(passes).fill(src).join(', '),
    backgroundSize: `calc(100% / ${count}) auto`,
    backgroundPosition: 'left center',
    backgroundRepeat: 'repeat-x',
  };
}

/* Exactly one trimmed tile tall for a row of `count`. */
export function rosetteSeamlessRowAspect(count: number): string {
  return `${count * ROW_W} / ${ROW_H}`;
}

/* Background for a SINGLE trimmed motif, sized to its element. Used where each
   flower is its own element - a repeated background cannot be transformed tile
   by tile, so anything that rotates each flower needs one element per flower. */
export function rosetteMotifStyle(passes = 2): CSSProperties {
  const src = `url('${ROSETTE_ROW_SRC}')`;
  return {
    backgroundImage: Array(passes).fill(src).join(', '),
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };
}
