/**
 * Copyright (c) 2026 GTF
 * SPDX-License-Identifier: Apache-2.0
 */

import { Layout } from "../layout/layout.js";
import { LayoutNode } from "../layout/node.js";
import { SectionNode } from "../node/index.js";
import { OffsetMap, resolve } from "../resolve/resolve.js";
import { nodeLabel, nodeType, nodeValue } from "./shared.js";
import { Inspector, InspectorNode } from "./types.js";

function buildNodes(
    nodes: ReadonlyArray<LayoutNode>,
    offsets: OffsetMap
): InspectorNode[] {
    const result: InspectorNode[] = [];

    for (const node of nodes) {
        const offset = offsets.get(node) ?? 0;

        if (node instanceof SectionNode) {
            result.push({
                kind: "section",
                name: node.name,
                offset,
                size: node.size,
                nodes: buildNodes(node.nodes, offsets)
            });
        } else {
            result.push({
                kind: "leaf",
                type: nodeType(node),
                label: nodeLabel(node),
                offset,
                size: node.size,
                value: nodeValue(node)
            });
        }
    }

    return result;
}

/**
 * Returns JSON-serializable tree describing the layout's
 * complete structure.
 * 
 * ---
 * 
 * @example
 * 
 * ```json
 * // InspectorSection
 * {
 *   kind: "section",
 *   name: "file-header",
 *   offset: 0,
 *   size: 14,
 *   nodes: InspectorNode[]
 * }
 * ```
 * 
 * ---
 * 
 * @example
 * 
 * ```json
 * // InspectorLeaf
 * {
 *   kind: "leaf",
 *   type: "u32", // "u8" | "u16" | "i8" | ... | "bytes"
 *   label: "U32(102)",
 *   offset: 2,
 *   size: 4,
 *   value: 102 // number | string | number[] | null
 * }
 * ```
 * 
 * ---
 * 
 * @example
 * ```
 * const tree = inspect(layout);
 * 
 * // fully JSON-serializable
 * const json = JSON.stringify(tree, null, 4);
 * fs.writeFileSync("layout.json", json);
 * 
 * // navigate programatically
 * tree[0].kind; // "section"
 * tree[0].nodes[0].type; // "tag"
 * tree[0].nodes[0].value; // "BM"
 * tree[0].nodes[1].offset; // 0
 * ```
 * 
 * ---
 * 
 * @param root 
 * @returns 
 */
export function inspect(root: Layout): Inspector {
    const offsets = resolve(root);

    return buildNodes(root.nodes, offsets);
}