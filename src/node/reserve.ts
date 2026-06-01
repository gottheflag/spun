/**
 * Copyright (c) 2026 GTF
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutNode } from "../layout/node.js";

export class ReserveNode extends LayoutNode {
    value = 0;

    constructor(readonly size: 1 | 2 | 4) {
        super();
    }

    set(value: number): void {
        this.value = value;
    }

    _load(buffer: Uint8Array, offset: number): void {
        const dv = new DataView(buffer.buffer, buffer.byteOffset);

        if (this.size === 1)
            this.value = dv.getUint8(offset);
        if (this.size === 2)
            this.value = dv.getUint16(offset, true);
        if (this.size === 4)
            this.value = dv.getUint32(offset, true);
    }
}

/**
 * Allocates a fixed-size slot whose value is not known
 * at construction time.
 */
export const reserve = {
    /**
     * 1 byte slot.
     */
    u8(): ReserveNode {
        return new ReserveNode(1);
    },
    /**
     * 2 bytes slot.
     */
    u16(): ReserveNode {
        return new ReserveNode(2);
    },
    /**
     * 4 bytes slot.
     */
    u32(): ReserveNode {
        return new ReserveNode(4);
    },
};