/**
 * Copyright (c) 2026 GTF
 * SPDX-License-Identifier: Apache-2.0
 */

import { Layout } from "../layout/layout.js";
import { LayoutNode } from "../layout/node.js";
import { BytesNode } from "../node/bytes.js";
import { I16Node, I32Node, I8Node, RefNode, U16Node, U32Node, U8Node } from "../node/index.js";
import { ReserveNode } from "../node/reserve.js";
import { SectionNode } from "../node/section.js";
import { TagNode } from "../node/tag.js";
import { OffsetMap, resolve } from "../resolve/resolve.js";
import { FieldNode } from "../scheme/field.js";

function writeNodes(
    nodes: ReadonlyArray<LayoutNode>,
    view: DataView,
    offsets: OffsetMap
): void {
    for (const node of nodes) {
        const offset = offsets.get(node)!;

        if (node instanceof SectionNode) {
            writeNodes(node.nodes, view, offsets);
        } else if (node instanceof FieldNode) {
            writeNodes([node.inner], view, new Map([[node.inner, offsets.get(node)!]]));
        } else if (node instanceof U8Node) {
            view.setUint8(offset, node.value);
        } else if (node instanceof U16Node) {
            view.setUint16(offset, node.value, true);
        } else if (node instanceof U32Node) {
            view.setUint32(offset, node.value, true);
        } else if (node instanceof I8Node) {
            view.setInt8(offset, node.value);
        } else if (node instanceof I16Node) {
            view.setInt16(offset, node.value, true);
        } else if (node instanceof I32Node) {
            view.setInt32(offset, node.value, true);
        } else if (node instanceof RefNode) {
            view.setUint32(offset, node.resolvedValue, true);
        } else if (node instanceof ReserveNode) {
            if (node.size === 1) view.setUint8(offset, node.value);
            if (node.size === 2) view.setUint16(offset, node.value, true);
            if (node.size === 4) view.setUint32(offset, node.value, true);
        } else if (node instanceof TagNode) {
            for (let i = 0; i < node.value.length; i++) {
                view.setUint8(offset + i, node.value.charCodeAt(i));
            }
        } else if (node instanceof BytesNode) {
            for (let i = 0; i < node.value.byteLength; i++) {
                view.setUint8(offset + i, node.value[i]);
            }
        } else {
            node._emit(view, offset);
        }
    }
}

/**
 * Resolves the layout graph and serializes it to a `Uint8Array`.
 * 
 * ---
 * 
 * @example
 * ```
 * const file = layout(...);
 * const buf = emit(file);
 * 
 * fs.writeFileSync("output.bin", buf);
 * // or
 * socket.send(buf);
 * // or
 * new Blob([buf]);
 * ```
 * 
 * ---
 * 
 * @param root The root layout node
 * @returns A `Uint8Array` containing the serialized layout
 */
export function emit(root: Layout): Uint8Array {
    const offsets = resolve(root);
    const buffer = new ArrayBuffer(root.size);
    const view = new DataView(buffer);

    writeNodes(root.nodes, view, offsets);

    return new Uint8Array(buffer);
}