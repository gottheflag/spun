/**
 * Copyright (c) 2026 GTF
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutNode } from "../layout/node.js";

export class PadNode extends LayoutNode {
    constructor(readonly size: number) {
        super();
    }

    _load(): void {} // skip - padding bytes are not meaningful
}

/**
 * Inserts exactly `<n>` zero bytes.
 * 
 * ---
 * 
 * @example
 * 
 * pad(4)
 * 
 * before:
 * ```
 * 01 02 03 04 05 06 07 08
 * ```
 * 
 * after:
 * ```
 * 01 02 03 04 05 06 07 08 00 00 00 00
 * ```
 * 
 * ---
 * 
 * @param size The number of bytes to insert
 * @returns PadNode
 */
export function pad(size: number): PadNode {
    return new PadNode(size);
}