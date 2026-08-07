/**
 * Deterministic per-address avatar, generated purely from the address itself
 * - no upload, no backend, no external service. An Ethereum/BSC address is
 * already 20 bytes of effectively-random hex, so its own nibbles are reused
 * directly as the pattern's "random" bits instead of hashing anything.
 *
 * Renders a symmetric 5x5 grid (classic identicon look, mirrored left-right)
 * in a hue derived from another slice of the same address, as an inline SVG
 * data URI - works as a plain <img src>, no extra request.
 */
export function identiconDataUri(address: string, size = 40): string {
  const hex = address.toLowerCase().replace(/^0x/, "").padStart(40, "0");

  const cols = 5;
  const rows = 5;
  const half = Math.ceil(cols / 2); // 3 - the unique half; the rest mirrors it

  const grid: boolean[][] = [];
  let bitIndex = 0;
  for (let r = 0; r < rows; r++) {
    const left: boolean[] = [];
    for (let c = 0; c < half; c++) {
      const nibble = parseInt(hex[bitIndex % hex.length], 16);
      left.push(nibble % 2 === 0);
      bitIndex++;
    }
    grid.push([...left, ...left.slice(0, cols - half).reverse()]);
  }

  const hue = parseInt(hex.slice(0, 6), 16) % 360;
  const cell = size / cols;

  let cells = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c]) {
        cells += `<rect x="${c * cell}" y="${r * cell}" width="${cell}" height="${cell}"/>`;
      }
    }
  }

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    `<rect width="${size}" height="${size}" fill="hsl(${hue} 25% 14%)"/>` +
    `<g fill="hsl(${hue} 80% 55%)">${cells}</g>` +
    `</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
