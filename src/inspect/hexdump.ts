/**
 * Copyright (c) 2026 GTF
 * SPDX-License-Identifier: Apache-2.0
 */

import { Inspector, InspectorNode } from "./types.js";

function collectLeaves(nodes: InspectorNode[]): Extract<InspectorNode, { kind: "leaf" }>[] {
    const result: Extract<InspectorNode, { kind: "leaf" }>[] = [];
    
    for (const node of nodes) {
        if (node.kind === "section") {
            result.push(...collectLeaves(node.nodes));
        } else {
            result.push(node);
        }
    }

    return result;
}

/**
 * Classic hex dump to the console. \
 * reconstructing byte values from the inspect tree.
 * 
 * ---
 * 
 * @example
 * ```
 * hexdump(inspect(layout));
 * 
 * 00000000  42 4D 66 00 00 00 00 00 00 00 36 00 00 00 28 00
 * 00000010  00 00 04 00 00 00 04 00 00 00 01 00 18 00 00 00
 * 00000020  00 00 30 00 00 00 13 0B 00 00 13 0B 00 00 00 00
 * 00000030  00 00 00 00 00 00 80 FF 00 89 FF 55 93 FF AA 9D
 * 00000040  FF FF 80 AA 00 8A AA 55 93 AA AA 9D AA FF 80 55
 * 00000050  00 8A 55 55 94 55 AA 9E 55 FF 80 00 00 8A 00 55
 * 00000060  94 00 AA 9E 00 FF
 * ```
 * 
 * ---
 * 
 * @param inspector 
 * @param columns (default: 16, min: 1, max: 128)
 */
export function hexdump(inspector: Inspector, columns: number = 16): void {
    columns = Math.max(1, Math.min(columns, 128));
    
    // collect all leaf bytes in offset order
    const leaves = collectLeaves(inspector)
        .filter(l => l.size > 0 && Array.isArray(l.value) || typeof l.value !== "object")
        .sort((a, b) => a.offset - b.offset);

    // reconstruct flat byte array from inspector data
    const totalSize = leaves.reduce((max, l) => Math.max(max, l.offset + l.size), 0);
    const bytes = new Uint8Array(totalSize);

    for (const leaf of leaves) {
        if (leaf.type === "bytes" && Array.isArray(leaf.value)) {
            (leaf.value as number[]).forEach((b, i) => { bytes[leaf.offset + i] = b; });
        } else if (leaf.type === "tag" && typeof leaf.value === "string") {
            for (let i = 0; i < leaf.value.length; i++) {
                bytes[leaf.offset + i] = leaf.value.charCodeAt(i);
            }
        } else if (typeof leaf.value === "number") {
            // write little-endian
            let val = leaf.value >>> 0;
            for (let i = 0; i < leaf.size; i++) {
                bytes[leaf.offset + i] = val & 0xFF;
                val >>>= 8;
            }
        }
    }

    for (let i = 0; i < bytes.length; i += columns) {
        const offset = i.toString(16).padStart(8, "0").toUpperCase();
        const slice = bytes.slice(i, i + columns);
        const hex = Array.from(slice, b =>
            b.toString(16).padStart(2, "0").toUpperCase()
        ).join(" ");
        console.log(`${offset}  ${hex}`);
    }
}