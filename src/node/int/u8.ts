/**
 * Copyright (c) 2026 GTF
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutNode } from "../../layout/node.js";

export class U8Node extends LayoutNode {
    readonly size = 1;
    value: number;

    constructor(value: number) {
        super();
        this.value = value;
    }

    _load(buffer: Uint8Array, offset: number): void {
        this.value = buffer[offset];
    }
}

/**
 * 1 byte unsigned integer.
 * 
 * @param value `0` to `255` (default: 0)
 * @returns U8Node
 */
export function u8(value: number=0): U8Node {
    return new U8Node(value);
}