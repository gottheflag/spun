/**
 * Copyright (c) 2026 GTF
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutNode } from "../layout/node.js";

export class TagNode extends LayoutNode {
    size: number;
    value: string;

    constructor(source: string | number) {
        super();

        if (typeof source === "number") {
            this.size = source;
            this.value = '';
        } else {
            this.size = source.length;
            this.value = source;
        }
    }

    _load(buffer: Uint8Array, offset: number): void {
        this.value = Array.from(
            { length: this.size },
            (_, i) => String.fromCharCode(buffer[offset + i])
        ).join('');
    }
}

/**
 * Encodes an ASCII string literal as raw bytes. \
 * One byte per character.
 * 
 * @remarks Commonly used for e.g. binary magic numbers, format signatures.
 * 
 * @param value ASCII string literal (e.g. `"PNG\r\n\x1A\n"`)
 * @returns 
 */
export function tag(value: string | number): TagNode {
    return new TagNode(value);
}