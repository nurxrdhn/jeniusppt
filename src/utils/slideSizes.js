export const SLIDE_SIZES = {
  wide: { label: '16:9 (1920×1080)', width: 1920, height: 1080 },
  standard: { label: '4:3 (1440×1080)', width: 1440, height: 1080 },
  portrait: { label: 'Portrait (1080×1920)', width: 1080, height: 1920 },
  a4landscape: { label: 'A4 Landscape', width: 1684, height: 1191 },
  a4portrait: { label: 'A4 Portrait', width: 1191, height: 1684 },
};
export function ratioStyle(size) { return { aspectRatio: `${size.width} / ${size.height}` }; }
