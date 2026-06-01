/**
 * Copyright (c) 2026 GTF
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutNode } from "../../layout/node.js";

export class I32Node extends LayoutNode {
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
        ).getInt32(offset, true);
    }
}

/**
 * 4 bytes signed integer.
 * 
 * @param value `-2,147,483,648` to `2,147,483,647` (default: 0)
 * @returns I32Node
 */
export function i32(value: number=0): I32Node {
    return new I32Node(value);
}
