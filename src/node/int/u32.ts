/**
 * Copyright (c) 2026 GTF
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutNode } from "../../layout/node.js";

export class U32Node extends LayoutNode {
    readonly size = 4;
    value: number;

    constructor(value: number) {
        super();

        this.value = value;
    }

    _load(buffer: Uint8Array, offset: number): void {
        this.value = new DataView(
            buffer.buffer,
            buffer.byteOffset
        ).getUint32(offset, true);
    }
}

/**
 * 4 bytes unsigned integer.
 * 
 * @param value `0` to `4,294,967,295` (default: 0)
 * @returns U32Node
 */
export function u32(value: number=0): U32Node {
    return new U32Node(value);
}
