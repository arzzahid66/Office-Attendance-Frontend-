import struct
import zlib


def write_png(path, size, rgb):
    width = height = size
    r, g, b = rgb

    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data))

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)

    raw = bytearray()
    for y in range(height):
        raw.append(0)
        for x in range(width):
            # simple padded square: solid color with a slightly darker border
            border = x < size // 16 or x >= size - size // 16 or y < size // 16 or y >= size - size // 16
            if border:
                raw.extend([max(r - 40, 0), max(g - 40, 0), max(b - 40, 0)])
            else:
                raw.extend([r, g, b])

    compressed = zlib.compress(bytes(raw), 9)

    with open(path, "wb") as f:
        f.write(sig)
        f.write(chunk(b"IHDR", ihdr))
        f.write(chunk(b"IDAT", compressed))
        f.write(chunk(b"IEND", b""))


write_png("pwa-192.png", 192, (37, 99, 235))
write_png("pwa-512.png", 512, (37, 99, 235))
write_png("maskable-512.png", 512, (37, 99, 235))
print("icons generated")
