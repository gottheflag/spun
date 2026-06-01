/**
 * Copyright (c) 2026 GTF
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutNode } from "../../layout/node.js";

export class I16Node extends LayoutNode {
    readonly size = 2;
    value: number;

    constructor(value: number) {
        super();

        this.value = value;
    }

    _load(buffer: Uint8Array, offset: number): void {
        this.value = new DataView(
            buffer.buffer,
            buffer.byteOffset
        ).getInt16(offset, true);
    }
}

/**
 * 2 bytes signed integer.
 * 
 * @param value `-32,768` to `32,767` (default: 0)
 * @returns I16Node
 */
export function i16(value: number=0): I16Node {
    return new I16Node(value);
}
