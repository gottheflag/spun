/**
 * Copyright (c) 2026 GTF
 * SPDX-License-Identifier: Apache-2.0
 */

import { Layout } from "../layout/layout.js";
import { LayoutNode } from "../layout/node.js";
import { resolveNode } from "../layout/registry.js";
import { AlignNode, BytesNode, I16Node, I32Node, I8Node, PadNode, ReserveNode, TagNode, U16Node, U32Node, U8Node } from "../node/index.js";
import { SectionNode } from "../node/section.js";
import { Inspector, InspectorNode } from "./types.js";

function restoreNode(node: InspectorNode): LayoutNode {
    if (node.kind === "section") {
        const children = node.nodes.map(restoreNode);
        return new SectionNode(node.name, ...children);
    }

    switch (node.type) {
        case "u8":
            return new U8Node(node.value as number);
        case "u16":
            return new U16Node(node.value as number);
        case "u32":
            return new U32Node(node.value as number);

        case "i8":
            return new I8Node(node.value as number);
        case "i16":
            return new I16Node(node.value as number);
        case "i32":
            return new I32Node(node.value as number);

        case "tag":
            return new TagNode(node.value as string);
        case "pad":
            return new PadNode(node.size);
        case "align":
            return new AlignNode(node.size);

        case "ref": {
            const n = new U32Node(node.value as number);
            return n;
        }

        case "reserve.u8": {
            const r = new ReserveNode(1);
            r.set(node.value as number);

            return r;
        }
        case "reserve.u16": {
            const r = new ReserveNode(2);
            r.set(node.value as number);

            return r;
        }
        case "reserve.u32": {
            const r = new ReserveNode(4);
            r.set(node.value as number);

            return r;
        }

        case "bytes": {
            const data = new Uint8Array(node.value as number[]);
            return new BytesNode(data);
        }


        default: {
            const ctor = resolveNode(node.type);
            if (ctor) {
                if (typeof (ctor as any).fromInspect === "function") {
                    return (ctor as any).fromInspect(node);
                }

                throw new Error(`serialize: custom node "${node.type}" is registered but missing static fromInspect()`);
            }

            throw new Error(`serialize: unknown node type "${node.type}"`);
        }
    }
}

/**
 * Restores a fully live `Layout` from an `Inspector` tree or JSON string. \
 * The restored layout is fully functional - emittable, inspectable, etc.
 * 
 * ---
 * 
 * @example
 * ```
 * // from Inspector object
 * const tree = inspect(layout);
 * const restored = serialize(tree);
 * 
 * // from JSON string - full round-trip
 * const json = JSON.stringify(inspect(layout));
 * const restored = serialize(json);
 * 
 * // fully live
 * emit(restored); // identical `Uint8Array`
 * inspect(restored); // same tree
 * ```
 * 
 * ---
 * 
 * @see {@link LayoutNode._load}
 * 
 * @param input 
 * @returns 
 */
export function serialize(input: Inspector | string): Layout {
    const tree: Inspector = typeof input === "string"
        ? JSON.parse(input)
        : input;

    const nodes = tree.map(restoreNode);
    return new Layout(...nodes);
}