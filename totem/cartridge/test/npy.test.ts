import { describe, expect, test } from "bun:test"
import { writeNpyFloat32 } from "../src/npy"

// Minimal .npy reader, test-only: parses back what writeNpyFloat32 produced to
// prove the binary format round-trips, rather than trusting the writer blind.
function readNpyFloat32(buf: Buffer): { shape: [number, number]; data: Float32Array } {
  expect(buf.subarray(0, 6).toString("latin1")).toBe("\x93NUMPY")
  const headerLen = buf.readUInt16LE(8)
  const header = buf.subarray(10, 10 + headerLen).toString("latin1")
  const shapeMatch = /'shape':\s*\((\d+),\s*(\d+)\)/.exec(header)
  if (!shapeMatch) throw new Error("could not parse shape from header")
  const shape: [number, number] = [Number(shapeMatch[1]), Number(shapeMatch[2])]
  const dataStart = 10 + headerLen
  const data = new Float32Array(shape[0] * shape[1])
  for (let i = 0; i < data.length; i++) data[i] = buf.readFloatLE(dataStart + i * 4)
  return { shape, data }
}

describe("writeNpyFloat32", () => {
  test("round-trips shape and values", () => {
    const vectors = [Float32Array.from([1, 2, 3]), Float32Array.from([4, 5, 6])]
    const buf = writeNpyFloat32(vectors, 3)
    const { shape, data } = readNpyFloat32(buf)
    expect(shape).toEqual([2, 3])
    expect(Array.from(data)).toEqual([1, 2, 3, 4, 5, 6])
  })

  test("header is padded to a 64-byte boundary", () => {
    const buf = writeNpyFloat32([Float32Array.from([1])], 1)
    const headerLen = buf.readUInt16LE(8)
    expect((10 + headerLen) % 64).toBe(0)
  })

  test("empty vector list produces a valid zero-row array", () => {
    const buf = writeNpyFloat32([], 768)
    const { shape, data } = readNpyFloat32(buf)
    expect(shape).toEqual([0, 768])
    expect(data.length).toBe(0)
  })
})
