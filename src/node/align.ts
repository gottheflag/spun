/**
 * Copyright (c) 2026 GTF
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutNode } from "../layout/node.js";

export class AlignNode extends LayoutNode {
    /**
     * Resolved later (depends on preceding offset)
     */
    size = 0;

    constructor(readonly boundary: number) {
        super();
    }

    _load(_buffer: Uint8Array, offset: number): void {
        const remainder = offset % this.boundary;

        this.size = remainder === 0
            ? 0
            : this.boundary - remainder;
    }
}

/**
 * Inserts however many zero-padding bytes are needed,
 * to bring the cursor to the next multiple of the boundary.
 * 
 * ---
 * 
 * @example
 * 
 * align(6)
 * 
 * remainder = offset % boundary
 * 
 * ```
 * [1] [2] [3] [4] [5] [6] [7] [8]
 *          ^
 * ```
 * 
 * remainder = 3 % 6 = 3 (3 bytes remaining to reach 6)
 * 
 * ```
 * [1] [2] [3] [4] [5] [6] [7] [8]
 *                      ^
 * ```
 * 
 * So by moving 3 bytes from 3 to 6, we're aligned to 6 (boundary).
 * 
 * @remarks when the cursor is already aligned, the size is 0.
 * 
 * ---
 * 
 * @param boundary The alignment boundary
 * @returns AlignNode
 */
export function align(boundary: number): AlignNode {
    return new AlignNode(boundary);
}