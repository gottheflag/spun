/**
 * Copyright (c) 2026 GTF
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutNode } from "../layout/node.js";
import { validateName } from "../utils/validate.js";

export class SectionNode extends LayoutNode {
    readonly nodes: ReadonlyArray<LayoutNode>;

    constructor(readonly name: string, ...nodes: LayoutNode[]) {
        super();
        validateName(name, "section()");

        this.nodes = nodes;
    }

    get size(): number {
        return this.nodes.reduce((sum, node) => sum  + node.size, 0);
    }

    _load(_buffer: Uint8Array, _offset: number, _remaining: number): void {}
}

/**
 * A named group of nodes. \
 * Sections are themselves `LayoutNode` instances. \
 * They can be nested arbitrarily and appear
 * anywhere nodes are accepted.
 * 
 * @param name Section name (e.g. `"header"`)
 * @param nodes Section nodes (e.g. bytes, tag, etc.)
 * @returns 
 */
export function section(name: string, ...nodes: LayoutNode[]): SectionNode {
    return new SectionNode(name, ...nodes);
}