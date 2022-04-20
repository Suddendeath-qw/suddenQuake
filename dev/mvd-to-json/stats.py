#!/usr/bin/env python
import struct
import json
import sys
import os

with open(sys.argv[1], "rb") as fd:
    data = fd.read()

offset = data.rfind(b"\x0a\x00\x00\x03\x00\x00\x00\x00")
offset += 2

content = b""

while data[offset:offset + 4] == b"\x00\x03\x00\x00":
    (length,) = struct.unpack("<H", data[offset+10:offset+12])
    start = offset + 18
    end = start + length - 2
    content += data[start:end]
    offset = end

try:
    json.loads(content)
    print("success", sys.argv[1])
    (name, _) = os.path.splitext(sys.argv[1])

    with open(name + ".json", "wb+") as fd:
        fd.write(content)
except:
    print("failed to load", sys.argv[1])