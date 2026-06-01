/**
 * Copyright (c) 2026 GTF
 * SPDX-License-Identifier: Apache-2.0
 */

import { Inspector, InspectorNode } from "./types.js";

function printTree(nodes: InspectorNode[], prefix: string = ""): void {
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const last = i === nodes.length - 1;
        const branch = last ? "└─" : "├─";
        const child = last ? "   " : "│  ";
        const off = `@${node.offset.toString(16).padStart(4, "0")}`;
        const size = `+${node.size}`;

        if (node.kind === "section") {
            console.log(`${prefix}${branch} Section("${node.name}")  ${off}  ${size}`);
            printTree(node.nodes, prefix + child);
        } else {
            const meta = `${off}  ${size}`.padStart(14);
            console.log(`${prefix}${branch} ${node.label.padEnd(28)} ${meta}`);
        }
    }
}

/**
 * Convenience printer. \
 * Prints a tree to the console. \
 * A thin helper built on top of `inspect()`. \
 * Not a core primitive.
 * 
 * ---
 * 
 * @example
 * ```
 * treeview(inspect(layout));
 * 
 * Layout
 * ├─ Section("file-header")  \@0000  +14
 * │  ├─ Tag("BM")                         \@0000  +2
 * │  ├─ U32(102) (fileSize)               \@0002  +4
 * │  ├─ U32(0)                            \@0006  +4
 * │  └─ U32(54) (pixelOffset)             \@000a  +4
 * ├─ Section("dib-header")  \@000e  +40
 * │  ├─ U32(40)                           \@000e  +4
 * │  ├─ I32(4) (width)                    \@0012  +4
 * │  ├─ I32(4) (height)                   \@0016  +4
 * │  ├─ U16(1)                            \@001a  +2
 * │  ├─ U16(24) (bpp)                     \@001c  +2
 * │  ├─ U32(0)                            \@001e  +4
 * │  ├─ U32(48) (imageSize)               \@0022  +4
 * │  ├─ I32(2835)                         \@0026  +4
 * │  ├─ I32(2835)                         \@002a  +4
 * │  ├─ U32(0)                            \@002e  +4
 * │  └─ U32(0)                            \@0032  +4
 * └─ Section("pixels")  \@0036  +48
 *    └─ Bytes(48)                        \@0036  +48
 * 
 * ```
 * 
 * ---
 * 
 * @param inspector 
 */
export function treeview(inspector: Inspector): void {
    console.log("Layout");
    printTree(inspector);
}