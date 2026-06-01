/**
 * Copyright (c) 2026 GTF
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutNode } from "../layout/node.js";
import { validateName } from "../utils/validate.js";

export class FieldNode extends LayoutNode {
    constructor(
        readonly name: string,
        readonly inner: LayoutNode
    ) {
        super();
        validateName(name, "field()");
    }

    get size(): number {
        return this.inner.size;
    }

    _load(buffer: Uint8Array, offset: number, remaining: number): void {
        this.inner._load(buffer, offset, remaining);
    }

    get value(): unknown {
        return (this.inner as any).value;
    }

    /**
     * Mutates the value of a named field in place. \
     * Works on any `FieldNode`, result of `emit()` is updated automatically.
     * 
     * ---
     * 
     * @example
     * ```
     * const bmp = bmpScheme.load(buffer);
     * 
     * bmp.get("dib-header.width").value; // 4
     * bmp.get("dib-header.width").set(800);
     * 
     * const out = emit(bmp); // width field now `800`
     * 
     * // wildcard set - all "size" fields to 0
     * (bmp.get("*.size") as FieldNode[]).forEach(f => f.set(0));
     * ```
     * 
     * ---
     * 
     * @param value 
     */
    set(value: number): void {
        (this.inner as any).value = value;
    }
}

/**
 * Wraps any node with a name, making it addressable.
 * 
 * ---
 * 
 * @example
 * ```
 * field("fileSize", u32());
 * field("pixel-data", bytes(sizeof("imageSize")));
 * ```
 * 
 * ---
 * 
 * @param name 
 * @param node 
 * @returns 
 */
export function field(name: string, node: LayoutNode): FieldNode {
    return new FieldNode(name, node);
}