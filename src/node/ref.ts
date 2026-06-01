/**
 * Copyright (c) 2026 GTF
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutNode } from "../layout/node.js";

export class RefNode extends LayoutNode {
    readonly size = 4;
    resolvedValue = 0;

    constructor(readonly target: LayoutNode) {
        super();
    }

    _load(buffer: Uint8Array, offset: number): void {
        this.resolvedValue = new DataView(
            buffer.buffer,
            buffer.byteOffset
        ).getUint32(offset, true);
    }
}

/**
 * Symbolic reference to another node.
 * 
 * The target node is resolved at render time.
 * 
 * ---
 * 
 * @example
 * ```
 * const body = section("body", bytes(data));
 * const file = layout(
 *   tag("TEX0"),
 *   ref(body),
 *   body
 * );
 * ```
 * 
 * @param target The target node
 * @returns RefNode
 */
export function ref(target: LayoutNode): RefNode {
    return new RefNode(target);
}