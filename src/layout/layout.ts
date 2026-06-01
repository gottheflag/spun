/**
 * Copyright (c) 2026 GTF
 * SPDX-License-Identifier: Apache-2.0
 */

import { SectionNode } from "../node/section.js";
import { resolve } from "../resolve/resolve.js";
import { FieldNode } from "../scheme/field.js";
import { validateName } from "../utils/validate.js";
import { LayoutNode } from "./node.js";

/**
 * Base layout class.
 */
export class Layout {
    /**
     * List of nodes in the layout.
     * 
     * Nodes are indexed order-preserved array,
     * and they're readonly so the data can only be manipulated through the layout.
     */
    readonly nodes: ReadonlyArray<LayoutNode>;

    constructor(...nodes: LayoutNode[]) {
        this.nodes = nodes
    }

    /**
     * Total size of the layout.
     * 
     * e.g. 
     */
    get size(): number {
        return this.nodes.reduce((sum, node) => sum + node.size, 0);
    }

    /**
     * Get a node by query string.
     * Wildcard - all matching nodes, up to `max`.
     * 
     * ---
     * 
     * @remarks Each segment must match the pattern defined in {@link validateName}. \
     * Use `*` as a wildcard to match any name. Dot notation separates levels:
     * `"section-name.field-name"`.
     * 
     * ---
     * 
     * @example
     * ```
     * const bmp = bmpScheme.load(buffer);
     * 
     * // by name - searches all sections
     * bmp.get("width").value;
     * 
     * // by dot path
     * bmp.get("dib-header.width").value;
     * bmp.get("file-header"); // SectionNode
     * 
     * // by byte offset
     * bmp.get(18); // node at offset 18
     * 
     * // by byte range
     * bmp.get(0, 14); // all nodes in [0, 14)
     * 
     * // wildcard - all fields named "size"
     * bmp.get("*.size"); // LayoutNode[]
     * 
     * // wildcard with max results
     * bmp.get("*.size", 3); // LayoutNode[] (max 3)
     * 
     * ```
     * 
     * ---
     * 
     * @param path
     * @param max maximum number of nodes to return
     * @returns `LayoutNode[]` (if contains wildcard), otherwise `LayoutNode`.
     * @throws if path not found
     */
    get(path: `${string}*${string}`, max?: number): LayoutNode[];
    get(path: string, max?: number): LayoutNode;
    get(offset: number): LayoutNode;
    get(start: number, end: number): LayoutNode[];
    get(query: string | number, second?: number): LayoutNode | LayoutNode[] {
        if (typeof query === "string") {
            const isWildcard = query.includes('*');
            const parts = query.split('.');

            for (const part of parts) {
                if (part !== '*') {
                    validateName(part, `get("${query}")`);
                }
            }

            if (isWildcard) {
                const max = typeof second === "number"
                    ? second : Infinity;

                const results = resolveWildcard(this.nodes, parts, max);

                return results;
            }

            const result = resolveGet(this.nodes, parts);
            if (!result) {
                throw new Error(`get("${query}"): not found`);
            }

            return result;
        }

        const offsets = resolve(this);

        if (second === undefined) {
            for (const [node, off] of offsets) {
                if (off === query && !(node instanceof SectionNode)) return node;
            }

            throw new Error(`get(${query}): no node at offset ${query}`);
        }

        const results: LayoutNode[] = [];
        for (const [node, off] of offsets) {
            if (node instanceof SectionNode) continue;

            if (off >= query && off + node.size <= second) {
                results.push(node);
            }
        }

        return results;
    }
}

function resolveGet(nodes: ReadonlyArray<LayoutNode>, parts: string[]): LayoutNode | null {
    const [head, ...rest] = parts;

    for (const node of nodes) {
        if (node instanceof SectionNode) {
            if (node.name === head) {
                if (rest.length === 0) {
                    return node;
                }

                return resolveGet(node.nodes, rest);
            }

            const found = resolveGet(node.nodes, parts);

            if (found) return found;
        } else if (node instanceof FieldNode) {
            if (node.name === head && rest.length === 0) {
                return node;
            }
        }
    }

    return null;
}

function resolveWildcard(
    nodes: ReadonlyArray<LayoutNode>,
    parts: string[],
    max: number,
    results: LayoutNode[] = []
): LayoutNode[] {
    if (results.length >= max) return results;

    const [head, ...rest] = parts;

    for (const node of nodes) {
        if (results.length >= max) break;

        const nameMatches = (name: string) => head === '*' || head === name;

        if (node instanceof SectionNode) {
            if (nameMatches(node.name)) {
                if (rest.length === 0) {
                    results.push(node);
                } else {
                    resolveWildcard(node.nodes, rest, max, results);
                }
            } else if (head === "*" && rest.length === 0) {
                results.push(node);
            } else {
                resolveWildcard(node.nodes, parts, max, results);
            }
        } else if (node instanceof FieldNode) {
            if (nameMatches(node.name) && rest.length === 0) {
                results.push(node);
            }
        }
    }

    return results;
}

/**
 * Layouts are a way to structure binary data in a tree-like form.
 * 
 * ---
 * 
 * @example
 * ```
 * const file = layout(
 *   section("header", tag("BM"), u32(102)),
 *   section("body", bytes(data)),
 * );
 * 
 * file.nodes;
 * file.size;
 * ```
 * 
 * @param nodes 
 * @returns `Layout`
 */
export function layout(...nodes: LayoutNode[]): Layout {
    return new Layout(...nodes);
}