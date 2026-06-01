/**
 * Copyright (c) 2026 GTF
 * SPDX-License-Identifier: Apache-2.0
 */

import { Layout } from "../layout/layout.js";
import { LayoutNode } from "../layout/node.js";
import { AlignNode } from "../node/align.js";
import { RefNode } from "../node/ref.js";
import { SectionNode } from "../node/section.js";
import { FieldNode } from "../scheme/field.js";

export type OffsetMap = Map<LayoutNode, number>;

function walkNodes(
    nodes: ReadonlyArray<LayoutNode>,
    cursor: number,
    offsets: OffsetMap
): number {
    for (const node of nodes) {
        if (node instanceof AlignNode) {
            const remainder = cursor % node.boundary;
            node.size = remainder === 0
                ? 0
                : node.boundary - remainder;
        }

        if (node instanceof FieldNode) {
            offsets.set(node, cursor);
            offsets.set(node.inner, cursor);
            cursor += node.size;

            continue;
        }
        
        offsets.set(node, cursor);

        if (node instanceof SectionNode) {
            cursor = walkNodes(node.nodes, cursor, offsets);
        } else {
            cursor += node.size;
        }
    }

    return cursor;
}

function resolveRefs(
    nodes: ReadonlyArray<LayoutNode>,
    offsets: OffsetMap
): void {
    for (const node of nodes) {
        if (node instanceof RefNode) {
            const target = offsets.get(node.target);
            
            if (target === undefined) {
                throw new Error(`ref() target not found in layout`);
            }
            node.resolvedValue = target;
        } else if (node instanceof SectionNode) {
            resolveRefs(node.nodes, offsets);
        }
    }
}

/**
 * Runs the resolution phase.
 * 
 * @remarks Maps each node to its offset in
 *  the layout (called internally by `emit`, exposed for tooling).
 * 
 * @param root 
 * @returns OffsetMap
 */
export function resolve(root: Layout): OffsetMap {
    const offsets: OffsetMap = new Map();

    walkNodes(root.nodes, 0, offsets);
    resolveRefs(root.nodes, offsets);

    return offsets;
}