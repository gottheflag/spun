/**
 * Copyright (c) 2026 GTF
 * SPDX-License-Identifier: Apache-2.0
 */

import { emit, resolve } from "../src/index.js";
import { hexdump } from "../src/inspect/hexdump.js";
import { inspect } from "../src/inspect/inspect.js";
import { serialize } from "../src/inspect/serialize.js";
import { treeview } from "../src/inspect/treeview.js";
import { InspectorLeaf } from "../src/inspect/types.js";
import { Layout, layout } from "../src/layout/layout.js";
import { LayoutNode } from "../src/layout/node.js";
import { registerNode } from "../src/layout/registry.js";
import { align, bytes, i16, i32, i8, pad, ref, reserve, section, tag, u16, u32, u8 } from "../src/node/index.js";
import { field, FieldNode } from "../src/scheme/field.js";
import { scheme } from "../src/scheme/scheme.js";
import { sizeof } from "../src/scheme/sizeof.js";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
    if (condition) {
        console.log(`  ✓ ${label}`);
        passed++;
    } else {
        console.error(`  ✗ ${label}`);
        failed++;
    }
}

console.log("\nu8 node");
{
    const node = u8(42);

    assert(node.size === 1, "size is 1");
    assert(node.value === 42, "value is 42");

    const zero = u8(0);
    assert(zero.value === 0, "u8(0) value is 0");

    const max = u8(255);
    assert(max.value === 255, "u8(255) value is 255");

    console.log("\nu16 node");
    const n16 = u16(1000);
    assert(n16.size === 2, "size is 2");
    assert(n16.value === 1000, "value is 1000");

    console.log("\nu32 node");
    const n32 = u32(0xDEADBEEF);
    assert(n32.size === 4, "size is 4");
    assert(n32.value === 0xDEADBEEF, "value is 0xDEADBEEF");

    console.log("\ni8 node");
    const n8 = i8(-1);
    assert(n8.size === 1, "size is 1");
    assert(n8.value === -1, "value is -1");

    console.log("\ni16 node");
    const n16s = i16(-32768);
    assert(n16s.size === 2, "size is 2");
    assert(n16s.value === -32768, "value is -32768");

    console.log("\ni32 node");
    const n32s = i32(-1);
    assert(n32s.size === 4, "size is 4");
    assert(n32s.value === -1, "value is -1");
}

console.log("\nbytes node");
{
    const buf = new Uint8Array([0x01, 0x02, 0x03]);
    const bn = bytes(buf);
    assert(bn.size === 3, "size matches byteLength");
    assert(bn.value[0] === 0x01, "value[0] is 0x01");
    assert(bn.value[2] === 0x03, "value[2] is 0x03");

    const empty = bytes(new Uint8Array(0));
    assert(empty.size === 0, "empty bytes has size 0");

    console.log("\ntag node");
    const tn = tag("PNG");
    assert(tn.size === 3, "size matches string length");
    assert(tn.value === "PNG", "value is 'PNG'");

    const tex = tag("TEX0");
    assert(tex.size === 4, "TEX0 size is 4");
    assert(tex.value === "TEX0", "TEX0 value preserved");
}

console.log("\npad node");
{
    const p = pad(4);
    assert(p.size === 4, "pad(4) size is 4");

    const p0 = pad(0);
    assert(p0.size === 0, "pad(0) size is 0");

    console.log("\nalign node");
    const a = align(4);
    assert(a.boundary === 4, "boundary is 4");
    assert(a.size === 0, "size is 0 before resolution");

    const a16 = align(16);
    assert(a16.boundary === 16, "boundary is 16");
}

console.log("\nlayout");
{
    const l = layout(tag("EXE"), u16(1), pad(2));
    assert(l.nodes.length === 3, "holds 3 nodes");
    assert(l.size === 7, "size is 4+2+1 = 7");  // tag=3, u16=2, pad=2
    assert(l.nodes[0] instanceof Object, "nodes are accessible");

    const empty = layout();
    assert(empty.nodes.length === 0, "empty layout has 0 nodes");
    assert(empty.size === 0, "empty layout size is 0");
}

console.log("\nsection node");
{
    const sec = section("header", tag("EXE"), u16(1), pad(2));
    assert(sec.name === "header", "name is 'header'");
    assert(sec.nodes.length === 3, "holds 3 nodes");
    assert(sec.size === 7, "size is tag(3) + u16(2) + pad(2) = 7");

    const nested = layout(
        section("header", tag("PNG"), u32(1)),
        section("body", bytes(new Uint8Array(8))),
    );
    assert(nested.size === 15, "layout with sections: tag(3)+u32(4)+bytes(8) = 15");
    assert(nested.nodes.length === 2, "layout holds 2 sections");

    const empty = section("empty");
    assert(empty.size === 0, "empty section size is 0");
    assert(empty.nodes.length === 0, "empty section has no nodes");
}

console.log("\nresolve - flat layout");
{
    const t = tag("PNG");  // size 3
    const n = u32(1);      // size 4
    const p = pad(1);      // size 1
    const flat = layout(t, n, p);
    const offsets = resolve(flat);

    assert(offsets.get(t) === 0, "tag offset is 0");
    assert(offsets.get(n) === 3, "u32 offset is 3");
    assert(offsets.get(p) === 7, "pad offset is 7");

    console.log("\nresolve - layout with sections");
    const hTag = tag("EXE");  // size 3
    const hVer = u16(1);      // size 2
    const bData = bytes(new Uint8Array(8)); // size 8
    const sec1 = section("header", hTag, hVer);
    const sec2 = section("body", bData);
    const nested = layout(sec1, sec2);
    const no = resolve(nested);

    assert(no.get(sec1) === 0, "header section offset is 0");
    assert(no.get(hTag) === 0, "tag inside header offset is 0");
    assert(no.get(hVer) === 3, "u16 inside header offset is 3");
    assert(no.get(sec2) === 5, "body section offset is 5");
    assert(no.get(bData) === 5, "bytes inside body offset is 5");
}

console.log("\nresolve - align node");
{
    // cursor at 3, align to 4 > needs 1 byte
    const a1 = align(4);
    const l1 = layout(tag("PNG"), a1, u8(0));
    const o1 = resolve(l1);
    assert(a1.size === 1, "align(4) after offset 3 needs 1 byte");
    assert(o1.get(a1) === 3, "align node offset is 3");

    // cursor at 4, align to 4 > needs 0 bytes (already aligned)
    const a2 = align(4);
    const l2 = layout(u32(0), a2, u8(0));
    const o2 = resolve(l2);
    assert(a2.size === 0, "align(4) after offset 4 needs 0 bytes");

    // cursor at 6, align to 8 > needs 2 bytes
    const a3 = align(8);
    const l3 = layout(tag("PNG"), u16(1), a3, u8(0));
    const o3 = resolve(l3);
    assert(a3.size === 3, "align(8) after offset 5 needs 3 bytes");
    assert(o3.get(a3) === 5, "align node sits at offset 5");
}

console.log("\nemit - primitives");
{
    const out1 = emit(layout(u8(0xFF), u8(0x00), u8(0xAB)));
    assert(out1.length === 3, "output length is 3");
    assert(out1[0] === 0xFF, "byte 0 is 0xFF");
    assert(out1[1] === 0x00, "byte 1 is 0x00");
    assert(out1[2] === 0xAB, "byte 2 is 0xAB");

    console.log("\nemit - tag");
    const out2 = emit(layout(tag("PNG")));
    assert(out2[0] === 0x50, "P is 0x50");
    assert(out2[1] === 0x4E, "N is 0x4E");
    assert(out2[2] === 0x47, "G is 0x47");

    console.log("\nemit - u16 little-endian");
    const out3 = emit(layout(u16(0x0102)));
    assert(out3[0] === 0x02, "low byte first");
    assert(out3[1] === 0x01, "high byte second");

    console.log("\nemit - pad is zeroed");
    const out4 = emit(layout(u8(1), pad(3), u8(2)));
    assert(out4[1] === 0x00, "pad byte 0 is zero");
    assert(out4[2] === 0x00, "pad byte 1 is zero");
    assert(out4[3] === 0x00, "pad byte 2 is zero");
    assert(out4[4] === 0x02, "byte after pad is 2");

    console.log("\nemit - section");
    const out5 = emit(layout(
        section("header", tag("EXE"), u16(1)),
        section("body", u8(0xFF)),
    ));
    assert(out5.length === 6, "total length is tag(3)+u16(2)+u8(1) = 6");
    assert(out5[0] === 0x45, "E is 0x45");
    assert(out5[5] === 0xFF, "last byte is 0xFF");
}

console.log("\nref - resolution");
{
    const body = section("body", bytes(new Uint8Array(4)));
    const r = ref(body);
    const l = layout(tag("HDR"), r, body);
    // tag=3, ref=4, then body at offset 7
    const offsets = resolve(l);
    assert(r.resolvedValue === 7, "ref resolves to body offset (7)");
    assert(offsets.get(r) === 3, "ref node itself sits at offset 3");

    console.log("\nref - emitted bytes");
    const out = emit(l);
    // resolvedValue 7 as little-endian u32 = 07 00 00 00
    assert(out[3] === 0x07, "ref emits offset as little-endian u32 low byte");
    assert(out[4] === 0x00, "ref high bytes are zero");

    console.log("\nref - throws if target not in layout");
    let threw = false;
    try {
        const orphan = section("orphan", u8(0));
        emit(layout(ref(orphan)));
    } catch {
        threw = true;
    }
    assert(threw, "throws when ref target is not in layout");
}

console.log("\nreserve - default value");
{
    const ck = reserve.u32();
    assert(ck.size === 4, "reserve.u32 size is 4");
    assert(ck.value === 0, "initial value is 0");

    const ck8 = reserve.u8();
    assert(ck8.size === 1, "reserve.u8 size is 1");

    const ck16 = reserve.u16();
    assert(ck16.size === 2, "reserve.u16 size is 2");

    console.log("\nreserve - set before emit");
    const cs = reserve.u32();
    cs.set(0xDEADBEEF);
    const out1 = emit(layout(cs));
    const view1 = new DataView(out1.buffer);
    assert(view1.getUint32(0, true) === 0xDEADBEEF, "set value emitted correctly");

    console.log("\nreserve - set after layout construction");
    const late = reserve.u16();
    const l = layout(tag("EXE"), late, u8(0xFF));
    late.set(0x0102);
    const out2 = emit(l);
    assert(out2[3] === 0x02, "low byte of 0x0102 at offset 3");
    assert(out2[4] === 0x01, "high byte of 0x0102 at offset 4");

    console.log("\nreserve - zero emitted when unset");
    const unset = reserve.u32();
    const out3 = emit(layout(unset));
    assert(out3[0] === 0x00, "unset reserve emits zero");
}

console.log("\nintegration - texture file format");
{
    // Simulate a simple texture binary format:
    // [tag "TEX0"] [u32: offset to body] [u16: width] [u16: height] [body: pixel data]

    const pixelData = new Uint8Array(16).fill(0xAB);
    const body = section("body", bytes(pixelData));
    const bodyRef = ref(body);
    const checksum = reserve.u32();

    const tex = layout(
        section("header",
            tag("TEX0"),   // 4 bytes
            bodyRef,       // u32 ref to body offset - 4 bytes
            checksum,      // reserved u32 - 4 bytes
            u16(4),        // width  - 2 bytes
            u16(4),        // height - 2 bytes
        ),
        body,
    );

    // header = 4+4+4+2+2 = 16 bytes, so body starts at offset 16
    checksum.set(0xCAFEBABE);

    const out = emit(tex);

    assert(out.length === 32, "total size is 16 header + 16 pixels");
    assert(bodyRef.resolvedValue === 16, "ref resolves body at offset 16");
    assert(out[0] === 0x54, "T");
    assert(out[1] === 0x45, "E");
    assert(out[2] === 0x58, "X");
    assert(out[3] === 0x30, "0");

    const dv = new DataView(out.buffer);
    assert(dv.getUint32(4, true) === 16, "body offset written correctly");
    assert(dv.getUint32(8, true) === 0xCAFEBABE, "checksum written correctly");
    assert(dv.getUint16(12, true) === 4, "width written correctly");
    assert(dv.getUint16(14, true) === 4, "height written correctly");
    assert(out[16] === 0xAB, "first pixel byte correct");
    assert(out[31] === 0xAB, "last pixel byte correct");
}

console.log("\nbytes - extended signatures");
{
    const b1 = bytes(new Uint8Array([0x01, 0x02, 0x03]));
    assert(b1.size === 3, "bytes(Uint8Array) size from data");
    assert(b1.source instanceof Uint8Array, "source is Uint8Array");

    const b2 = bytes(16);
    assert(b2.size === 16, "bytes(n) fixed size");
    assert(b2.source === 16, "source is number");

    const ref_node = u32(512);
    const b3 = bytes(() => ref_node.value);
    assert(b3.size === 0, "bytes(fn) size is 0 until parsed");
    assert(typeof b3.source === "function", "source is function");

    const b4 = bytes();
    assert(b4.size === 0, "bytes() remainder size is 0 until parsed");
    assert(b4.source === null, "source is null for remainder");
}

{
    console.log("\nscheme - construction");
    const s = scheme(
        section("header", tag("BM"), u32(0), u32(0)),
        section("body", bytes(10)),
    );
    assert(s.nodes.length === 2, "scheme holds 2 sections");
    assert((s.nodes[0] as any).name === "header", "first section is header");
    assert((s.nodes[1] as any).name === "body", "second section is body");

    console.log("\nscheme - load produces independent layouts");
    const s2 = scheme(tag("OK"), u32(0), u8(0));
    const buf1 = emit(layout(tag("OK"), u32(0xDEAD), u8(0x01)));
    const buf2 = emit(layout(tag("OK"), u32(0xBEEF), u8(0x02)));

    const l1 = s2.load(buf1);
    const l2 = s2.load(buf2);

    assert((l1.nodes[1] as any).value === 0xDEAD, "l1 u32 is 0xDEAD");
    assert((l2.nodes[1] as any).value === 0xBEEF, "l2 u32 is 0xBEEF");
    assert((l1.nodes[2] as any).value === 0x01, "l1 u8 is 0x01");
    assert((l2.nodes[2] as any).value === 0x02, "l2 u8 is 0x02");

    // confirm truly independent - mutating l1 doesn't affect l2
    (l1.nodes[1] as any).value = 0xFFFF;
    assert((l2.nodes[1] as any).value === 0xBEEF, "l2 unaffected by l1 mutation");
}

{
    console.log("\nfield + sizeof - basic");
    const s = scheme(
        field("dataSize", u32()),
        bytes(sizeof("dataSize")),
    );

    const buf = new Uint8Array([0x03, 0x00, 0x00, 0x00, 0xAA, 0xBB, 0xCC]);
    const l = s.load(buf);

    assert((l.nodes[0] as any).value === 3, "field dataSize parsed as 3");
    assert((l.nodes[1] as any).value.length === 3, "bytes read 3 bytes via sizeof");
    assert((l.nodes[1] as any).value[0] === 0xAA, "byte 0 is 0xAA");
    assert((l.nodes[1] as any).value[2] === 0xCC, "byte 2 is 0xCC");

    console.log("\nfield + sizeof - two independent loads");
    const buf2 = new Uint8Array([0x02, 0x00, 0x00, 0x00, 0x11, 0x22]);
    const l2 = s.load(buf2);

    assert((l2.nodes[0] as any).value === 2, "second load dataSize is 2");
    assert((l2.nodes[1] as any).value.length === 2, "second load reads 2 bytes");
    assert((l.nodes[0] as any).value === 3, "first load unaffected");

    console.log("\nfield + sizeof - throws on missing field");
    let threw = false;
    try {
        const bad = scheme(bytes(sizeof("missing")));
        bad.load(new Uint8Array(4));
    } catch {
        threw = true;
    }
    assert(threw, "throws when sizeof references unknown field");
}

{
    console.log("\nlayout.get() - field access");
    const s = scheme(
        section("file-header",
            tag(2),
            field("fileSize", u32()),
            u32(),
            field("pixelOffset", u32()),
        ),
        section("dib-header",
            field("width", i32()),
            field("height", i32()),
        ),
    );

    const buf = emit(layout(
        section("file-header", tag("BM"), u32(102), u32(0), u32(54)),
        section("dib-header", i32(4), i32(8)),
    ));

    const l = s.load(buf);

    assert(l.get("file-header") instanceof Object, "get section by name");
    assert((l.get("fileSize") as any).value === 102, "get field by name (top-level search)");
    assert((l.get("file-header.fileSize") as any).value === 102, "get field by path");
    assert((l.get("file-header.pixelOffset") as any).value === 54, "get nested field by path");
    assert((l.get("dib-header.width") as any).value === 4, "get width by path");
    assert((l.get("dib-header.height") as any).value === 8, "get height by path");

    console.log("\nlayout.get() - throws on missing path");
    let threw = false;
    try { l.get("does.not.exist"); } catch { threw = true; }
    assert(threw, "throws when path not found");
}

{
    console.log("\nname validation - section");
    let threw = false;
    try { section(""); } catch { threw = true; }
    assert(threw, "section rejects empty name");

    threw = false;
    try { section("has space"); } catch { threw = true; }
    assert(threw, "section rejects name with space");

    threw = false;
    try { section("valid-name_01"); } catch { threw = false; }
    assert(!threw, "section accepts valid name");

    console.log("\nname validation - field");
    threw = false;
    try { field("", u8()); } catch { threw = true; }
    assert(threw, "field rejects empty name");

    threw = false;
    try { field("bad name!", u8()); } catch { threw = true; }
    assert(threw, "field rejects name with special chars");

    threw = false;
    try { field("camelCase-01", u8()); } catch { threw = false; }
    assert(!threw, "field accepts valid name");

    console.log("\nfield.set()");
    const fs = scheme(field("width", u32()));
    const fl = fs.load(new Uint8Array([0x04, 0x00, 0x00, 0x00]));
    const fw = fl.get("width") as FieldNode;
    assert(fw.value === 4, "initial value is 4");
    fw.set(800);
    assert(fw.value === 800, "value updated to 800");
}

{
    console.log("\nlayout.get(offset)");
    const gl = layout(
        tag("BM"),    // @0, size 2
        u32(0xDEAD), // @2, size 4
        u8(0xFF),    // @6, size 1
    );

    const gn1 = gl.get(0);
    assert((gn1 as any).value === "BM", "get(0) returns tag node");

    const gn2 = gl.get(2);
    assert((gn2 as any).value === 0xDEAD, "get(2) returns u32 node");

    const gn3 = gl.get(6);
    assert((gn3 as any).value === 0xFF, "get(6) returns u8 node");

    let threw = false;
    try { gl.get(99); } catch { threw = true; }
    assert(threw, "get(offset) throws when no node at offset");

    console.log("\nlayout.get(start, end)");
    const gr = layout(
        tag("BM"),    // @0 +2
        u32(0xDEAD), // @2 +4
        u16(0x0001), // @6 +2
        u8(0xFF),    // @8 +1
    );

    const range1 = gr.get(0, 6) as LayoutNode[];
    assert(range1.length === 2, "get(0,6) returns 2 nodes");
    assert((range1[0] as any).value === "BM", "first node is tag");
    assert((range1[1] as any).value === 0xDEAD, "second node is u32");

    const range2 = gr.get(6, 9) as LayoutNode[];
    assert(range2.length === 2, "get(6,9) returns 2 nodes");

    const empty = gr.get(99, 200) as LayoutNode[];
    assert(empty.length === 0, "get out of range returns empty array");
}

{
    console.log("\nlayout.get() - wildcard");
    const ws = scheme(
        section("chunk-a",
            field("size", u32()),
            field("type", u16()),
        ),
        section("chunk-b",
            field("size", u32()),
            field("type", u16()),
        ),
        section("chunk-c",
            field("size", u32()),
        ),
    );

    const wbuf = emit(layout(
        section("chunk-a", u32(10), u16(1)),
        section("chunk-b", u32(20), u16(2)),
        section("chunk-c", u32(30)),
    ));
    const wl = ws.load(wbuf);

    const allSections = wl.get("*");
    assert(allSections.length === 3, "get('*') returns all 3 sections");

    const allSizes = wl.get("*.size");
    assert(allSizes.length === 3, "get('*.size') finds 3 size fields");
    assert((allSizes[0] as any).value === 10, "first size is 10");
    assert((allSizes[1] as any).value === 20, "second size is 20");
    assert((allSizes[2] as any).value === 30, "third size is 30");

    const allTypes = wl.get("*.type");
    assert(allTypes.length === 2, "get('*.type') finds 2 type fields");

    const limited = wl.get("*.size", 2);
    assert(limited.length === 2, "get('*.size', 2) respects max");

    console.log("\nlayout.get() - wildcard set");
    wl.get("*.size").forEach(n => (n as FieldNode).set(99));
    const updatedSizes = wl.get("*.size");
    assert((updatedSizes[0] as any).value === 99, "all sizes updated to 99");
    assert((updatedSizes[1] as any).value === 99, "second size updated");
    assert((updatedSizes[2] as any).value === 99, "third size updated");

    console.log("\nlayout.get() - invalid path segment");
    let threw = false;
    try { wl.get("valid.bad name!"); } catch { threw = true; }
    assert(threw, "get() rejects invalid path segment");
}

{
    console.log("\ninspect - returns Inspector");
    const il = layout(
        section("header", tag("EXE"), u16(1), pad(2)),
        section("body", u8(0xFF)),
    );
    const tree = inspect(il);

    assert(tree.length === 2, "two top-level nodes");
    assert(tree[0].kind === "section", "first node is section");
    assert((tree[0] as any).name === "header", "first section name");
    assert((tree[0] as any).nodes.length === 3, "header has 3 children");
    assert((tree[0] as any).nodes[0].kind === "leaf", "first child is leaf");
    assert((tree[0] as any).nodes[0].type === "tag", "first child type is tag");
    assert((tree[0] as any).nodes[0].value === "EXE", "tag value is EXE");
    assert((tree[0] as any).nodes[0].offset === 0, "tag offset is 0");
    assert((tree[0] as any).nodes[1].type === "u16", "second child type is u16");
    assert((tree[0] as any).nodes[1].value === 1, "u16 value is 1");
    assert(tree[1].kind === "section", "second node is section");
    assert((tree[1] as any).nodes[0].value === 0xFF, "body u8 value is 0xFF");

    // JSON round-trip
    const json = JSON.stringify(tree);
    const restored = JSON.parse(json);
    assert(restored[0].name === "header", "JSON round-trip preserves section name");
    assert(restored[0].nodes[0].value === "EXE", "JSON round-trip preserves tag value");
    assert(typeof json === "string", "inspect output is JSON-serializable");
}

{
    console.log("\ntreeview - output");
    const tv = layout(
        section("header", tag("EXE"), u16(1)),
        section("body", u8(0xFF)),
    );
    const tlines: string[] = [];
    const _log = console.log;
    console.log = (l: string) => tlines.push(l);
    treeview(inspect(tv));
    console.log = _log;

    assert(tlines[0] === "Layout", "first line is Layout");
    assert(tlines.some(l => l.includes('Section("header")')), "header section present");
    assert(tlines.some(l => l.includes('Section("body")')), "body section present");
    assert(tlines.some(l => l.includes('Tag("EXE")')), "tag node present");

    console.log("\nhexdump - output");
    const hv = layout(tag("PNG"), u8(0xFF));
    const hlines: string[] = [];
    console.log = (l: string) => hlines.push(l);
    hexdump(inspect(hv));
    console.log = _log;

    assert(hlines.length === 1, "one row for 4 bytes");
    assert(hlines[0].startsWith("00000000"), "starts with offset");
    assert(hlines[0].includes("50 4E 47"), "PNG bytes present");
    assert(hlines[0].includes("FF"), "0xFF present");
}

{
    console.log("\nserialize - Inspector > Layout");
    const original = layout(
        section("header", tag("EXE"), u16(1), pad(2)),
        section("body", u8(0xFF), u32(0xDEAD)),
    );
    const tree = inspect(original);
    const restored = serialize(tree);

    assert(restored instanceof Layout, "serialize returns a Layout");
    assert(restored.size === original.size, "restored size matches original");

    const oe = emit(original);
    const re = emit(restored);
    assert(oe.length === re.length, "emitted lengths match");
    assert(oe.every((b, i) => b === re[i]), "emitted bytes are identical");

    console.log("\nserialize - JSON string > Layout");
    const json = JSON.stringify(tree);
    const fromJson = serialize(json);

    assert(fromJson.size === original.size, "from JSON size matches");
    const je = emit(fromJson);
    assert(je.every((b, i) => b === oe[i]), "from JSON bytes are identical");

    console.log("\nserialize - preserves section structure");
    assert(fromJson.nodes.length === 2, "two top-level sections");
    assert((fromJson.nodes[0] as any).name === "header", "first section is header");
    assert((fromJson.nodes[1] as any).name === "body", "second section is body");

    console.log("\nserialize - bytes round-trip");
    const data = new Uint8Array([0xAA, 0xBB, 0xCC, 0xDD]);
    const bl = layout(tag("DAT"), bytes(data));
    const br = serialize(inspect(bl));
    const be = emit(br);
    assert(be[0] === 0x44, "D preserved");
    assert(be[1] === 0x41, "A preserved");
    assert(be[2] === 0x54, "T preserved");
    assert(be[3] === 0xAA, "bytes[0] preserved");
    assert(be[6] === 0xDD, "bytes[3] preserved");
}

{
    console.log("\ncustom node - basic");

    class XoredNode extends LayoutNode {
        readonly size = 4;
        value: number;
        key: number;

        constructor(value: number, key: number) {
            super();
            this.value = value;
            this.key = key;
        }

        _emit(view: DataView, offset: number): void {
            view.setUint32(offset, this.value ^ this.key, true);
        }

        _inspect() {
            return {
                type: "xored",
                label: `XOR(${this.value}, key=${this.key})`,
                value: { raw: this.value, key: this.key },
            };
        }

        _load(buffer: Uint8Array, offset: number): void {
            const stored = new DataView(buffer.buffer).getUint32(offset, true);
            this.value = stored ^ this.key;
        }

        static fromInspect(node: InspectorLeaf): XoredNode {
            const v = node.value as { raw: number; key: number };
            return new XoredNode(v.raw, v.key);
        }
    }

    registerNode("xored", XoredNode);

    const xn = new XoredNode(0xDEAD, 0xFF);
    const xl = layout(tag("XOR"), xn);
    const xe = emit(xl);

    // emitted value should be XORed
    const dv = new DataView(xe.buffer);
    assert(dv.getUint32(3, true) === (0xDEAD ^ 0xFF), "custom node emits XORed value");

    console.log("\ncustom node - inspect");
    const xi = inspect(xl);
    assert(xi[1].kind === "leaf", "custom node appears as leaf");
    assert((xi[1] as any).type === "xored", "type is xored");
    assert((xi[1] as any).label.includes("XOR"), "label includes XOR");

    console.log("\ncustom node - serialize round-trip");
    const xj = JSON.stringify(inspect(xl));
    const xr = serialize(xj);
    const xre = emit(xr);
    assert(xre.length === xe.length, "restored length matches");
    assert(xre.every((b, i) => b === xe[i]), "restored bytes match");

    console.log("\nregisterNode - throws on duplicate key");
    let threw = false;
    try { registerNode("xored", XoredNode); } catch { threw = true; }
    assert(threw, "registerNode throws on duplicate key");
}

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);