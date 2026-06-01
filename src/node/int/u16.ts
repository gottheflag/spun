/**
 * Copyright (c) 2026 GTF
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutNode } from "../../layout/node.js";

export class U16Node extends LayoutNode {
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
        ).getUint16(offset, true);
    }
}

/**
 * 2 bytes unsigned integer.
 * 
 * @param value `0` to `65,535` (default: 0)
 * @returns U16Node
 */
export function u16(value: number=0): U16Node {
    return new U16Node(value);
}