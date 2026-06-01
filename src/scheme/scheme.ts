/**
 * Copyright (c) 2026 GTF
 * SPDX-License-Identifier: Apache-2.0
 */

import { Layout } from "../layout/layout.js";
import { LayoutNode } from "../layout/node.js";
import { BytesNode } from "../node/bytes.js";
import { SectionNode } from "../node/section.js";
import { FieldNode } from "./field.js";
import { SizeofRef } from "./sizeof.js";

export class Scheme {
    readonly nodes: ReadonlyArray<LayoutNode>;

    constructor(...nodes: LayoutNode[]) {
        this.nodes = nodes;
    }

    load(buffer: Uint8Array): Layout {
        const fieldMap = new Map<string, FieldNode>();
        const cloned = cloneNodes(this.nodes, fieldMap);

        resolveSizeof(cloned, fieldMap);
        walkLoad(cloned, buffer, 0);

        return new Layout(...cloned);
    }
}

function cloneNode(node: LayoutNode, fieldMap: Map<string, FieldNode>): LayoutNode {
    // deep clone so each `load()` produces an independent layout
    const copy = Object.create(Object.getPrototypeOf(node)) as LayoutNode;
    Object.assign(copy, node);

    if (node instanceof SectionNode) {
        (copy as any).nodes = cloneNodes(node.nodes, fieldMap);
    }

    if (node instanceof FieldNode) {
        const innerCopy = cloneNode(node.inner, fieldMap);
        (copy as any).inner = innerCopy;

        fieldMap.set(node.name, copy as FieldNode);
    }

    if (node instanceof BytesNode && node.source instanceof Uint8Array) {
        (copy as any).value = new Uint8Array(node.value);
    }

    return copy
}

function cloneNodes(nodes: ReadonlyArray<LayoutNode>, fieldMap: Map<string, FieldNode>): LayoutNode[] {
    return nodes.map(n => cloneNode(n, fieldMap));
}

function resolveSizeof(nodes: LayoutNode[], fieldMap: Map<string, FieldNode>): void {
    for (const node of nodes) {
        if (node instanceof SectionNode) {
            resolveSizeof(node.nodes as LayoutNode[], fieldMap);
        } else if (node instanceof BytesNode && node.source instanceof SizeofRef) {
            const name = node.source.name;
            const target = fieldMap.get(name);

            if (!target) {
                throw new Error(`sizeof("${name}"): no field named "${name}" found in scheme`);
            }

            (node as any).source = () => (target.value as number);
        }
    }
}

function walkLoad(nodes: LayoutNode[], buffer: Uint8Array, cursor: number): number {
    for (const node of nodes) {
        if (node instanceof SectionNode) {
            cursor = walkLoad(node.nodes as LayoutNode[], buffer, cursor);
        } else {
            const remaining = buffer.byteLength - cursor;
            node._load(buffer, cursor, remaining);
            cursor += node.size;
        }
    }

    return cursor;
}

/**
 * A structural template that describes the shape of a binary format. \
 * No values - only types and sizes. \
 * Calling `scheme.load(buffer)` produces an independent, fully
 * populated `Layout`.
 * 
 * @param nodes 
 * @returns 
 */
export function scheme(...nodes: LayoutNode[]): Scheme {
    return new Scheme(...nodes);
}