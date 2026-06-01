import { readFileSync, writeFileSync } from "fs";
import { scheme, Scheme } from "../src/scheme/scheme.js";
import { section, SectionNode } from "../src/node/section.js";
import { tag } from "../src/node/tag.js";
import { field, FieldNode } from "../src/scheme/field.js";
import { bytes, BytesNode, i32, u16, u32 } from "../src/node/index.js";
import { sizeof } from "../src/scheme/sizeof.js";
import { emit } from "../src/index.js";

const bmpScheme: Scheme = scheme(
    section("file-header",
        tag(2),
        field("fileSize", u32()),
        u32(),
        field("pixelOffset", u32()),
    ),
    section("dib-header",
        u32(),
        field("width", i32()),
        field("height", i32()),
        u16(),
        field("bpp", u16()),
        u32(),
        field("imageSize", u32()),
        i32(),
        i32(),
        u32(),
        u32(),
    ),
    section("pixels",
        bytes(sizeof("imageSize"))
    ),
);

// read
const buffer = readFileSync("sample-4x4.bmp");

// load
const bmp = bmpScheme.load(new Uint8Array(buffer));

const width  = (bmp.get("dib-header.width") as FieldNode).value as number;
const height = (bmp.get("dib-header.height") as FieldNode).value as number;
const bpp = (bmp.get("dib-header.bpp") as FieldNode).value as number;

const pixels = ((bmp.get("pixels") as SectionNode).nodes[0] as BytesNode).value;

const bytesPerPixel = bpp / 8;
const rowStride = Math.floor((bpp * width + 31) / 32) * 4;

// modify
for (let y = 0; y < height; y++) {
    const rowStart = y * rowStride;

    for (let x = 0; x < width; x++) {
        const p = rowStart + x * bytesPerPixel;

        const b = pixels[p];
        const g = pixels[p + 1];
        const r = pixels[p + 2];

        if (r === 255) {
            pixels[p + 2] = 255/2;
        }
    }
}

// emit
const result = emit(bmp);
writeFileSync("sample-4x4-edited.bmp", result);