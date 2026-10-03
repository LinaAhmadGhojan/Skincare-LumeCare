// Code 39 barcode as SVG. Real encoding, so a scanner can read the tracking number on the label.
const C39: Record<string, string> = {
  "0": "000110100", "1": "100100001", "2": "001100001", "3": "101100000", "4": "000110001", "5": "100110000",
  "6": "001110000", "7": "000100101", "8": "100100100", "9": "001100100", A: "100001001", B: "001001001",
  C: "101001000", D: "000011001", E: "100011000", F: "001011000", G: "000001101", H: "100001100",
  I: "001001100", J: "000011100", K: "100000011", L: "001000011", M: "101000010", N: "000010011",
  O: "100010010", P: "001010010", Q: "000000111", R: "100000110", S: "001000110", T: "000010110",
  U: "110000001", V: "011000001", W: "111000000", X: "010010001", Y: "110010000", Z: "011010000",
  "-": "010000101", ".": "110000100", " ": "011000100", "*": "010010100",
};

export function Barcode({ value, height = 64 }: { value: string; height?: number }) {
  const text = `*${value.toUpperCase().replace(/[^0-9A-Z.\- ]/g, "")}*`;
  const N = 2, W = 5, bars: { x: number; w: number }[] = [];
  let x = 0;
  for (const ch of text) {
    const pattern = C39[ch];
    for (let i = 0; i < 9; i++) {
      const w = pattern[i] === "1" ? W : N;
      if (i % 2 === 0) bars.push({ x, w });
      x += w;
    }
    x += N; // gap between characters
  }
  return (
    <svg className="barcode" viewBox={`0 0 ${x} ${height}`} preserveAspectRatio="none" role="img" aria-label={`Barcode ${value}`}>
      <rect width={x} height={height} fill="#fff" />
      {bars.map((b, i) => <rect key={i} x={b.x} y={0} width={b.w} height={height} fill="#000" />)}
    </svg>
  );
}
