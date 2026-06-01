/**
 * Copyright (c) 2026 GTF
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutNode } from "../../layout/node.js";

export class I8Node extends LayoutNode {
    readonly size = 1;
    value: number;

    constructor(value: number) {
        super();

        this.value = value;
    }

    _load(buffer: Uint8Array, offset: number): void {
        this.value = new DataView(
            buffer.buffer,
            buffer.byteOffset
        ).getInt8(offset);
    }
}

/**
 * 1 byte signed integer.
 * 
 * 
 * @param value `-128` to `127` (default: 0)
 * @returns I8Node
 */
export function i8(value: number=0): I8Node {
    return new I8Node(value);
}
