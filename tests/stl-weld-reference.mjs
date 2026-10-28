// Test-only oracle: exact f32 bits, stable first occurrence, signed zero preserved.
export function weldExactReference(vertices, triangles) {
  const floats = Float32Array.from(vertices);
  const bits = new Uint32Array(floats.buffer);
  const seen = new Map(), output = [], remap = new Uint32Array(floats.length / 3);
  for (let i = 0; i < floats.length; i += 3) {
    const key = `${bits[i]},${bits[i + 1]},${bits[i + 2]}`;
    let index = seen.get(key);
    if (index === undefined) {
      index = output.length / 3;
      seen.set(key, index);
      output.push(floats[i], floats[i + 1], floats[i + 2]);
    }
    remap[i / 3] = index;
  }
  return {vertices: output, triangles: Array.from(triangles, i => remap[i])};
}
