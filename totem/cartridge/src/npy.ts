// Minimal writer for the NumPy .npy v1.0 format: magic + version, an ASCII
// header describing dtype/shape, then raw little-endian data. Just enough to
// satisfy cartridge spec's `vectors.f32.npy` — no reader needed on this side,
// numpy/np.load reads it directly.
export function writeNpyFloat32(vectors: Float32Array[], dim: number): Buffer {
  const n = vectors.length
  const magic = Buffer.from("\x93NUMPY", "latin1")
  const version = Buffer.from([1, 0])

  const headerDict = `{'descr': '<f4', 'fortran_order': False, 'shape': (${n}, ${dim}), }`
  const preambleLen = magic.length + version.length + 2 // +2 for the header-length field itself
  const unpaddedLen = preambleLen + headerDict.length + 1 // +1 for trailing \n
  const paddedTotal = Math.ceil(unpaddedLen / 64) * 64
  const padding = " ".repeat(paddedTotal - unpaddedLen)
  const header = Buffer.from(headerDict + padding + "\n", "latin1")

  const headerLen = Buffer.alloc(2)
  headerLen.writeUInt16LE(header.length, 0)

  const data = Buffer.alloc(n * dim * 4)
  for (let i = 0; i < n; i++) {
    const row = vectors[i]
    for (let j = 0; j < dim; j++) {
      data.writeFloatLE(row[j] ?? 0, (i * dim + j) * 4)
    }
  }

  return Buffer.concat([magic, version, headerLen, header, data])
}
