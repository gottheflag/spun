/**
 * Copyright (c) 2026 GTF
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutNode } from "../layout/node.js";
import { SizeofRef } from "../scheme/sizeof.js";

export type BytesSource =
    /**
     * Emit - size known from data
     * 
     * @example
     * 
     * // Signature:
     * bytes(data: Uint8Array);
     * 
     * bytes(new Uint8Array([0xAA, 0xBB, 0xCC]));
     * 
     */
    | Uint8Array
    /**
     * Fixed (both emit/parse)
     * 
     * @example
     * 
     * bytes(n: number); // n-byte slot
     * bytes(16);        // 16-byte slot
     * 
     */
    | number
    /**
     * Lazy
     * 
     * @example
     * 
     * bytes(() => node.value); // size evaludated at parse time
     * bytes(() => 16);         // 16-byte slot
     * 
     */
    | (() => number)  // lazy - size from another node at parse time
    /**
     * Size Reference
     * 
     * Size of another named field in the same scheme
     * 
     * @example
     * 
     * bytes(sizeof("field-name"));
     * 
     */
    | SizeofRef
    /**
     * Consume Remainder
     * 
     * @example
     * 
     * ```
     * [1] [2] [3] [4] [5] [6] [7] [8]
     *                  ^
     * ```
     * 
     * bytes(); // consumes remaining bytes
     * 
     * ```
     * [1] [2] [3] [4] [5] [6] [7] [8]
     *                              ^
     * ```
     * 
     */
    | null;

export class BytesNode extends LayoutNode {
    value: Uint8Array;
    source: BytesSource;

    constructor(source: BytesSource) {
        super();
        this.source = source;

        if (source instanceof Uint8Array) {
            this.value = source;
        } else if (typeof source === "number") {
            this.value = new Uint8Array(source);
        } else {
            // lazy or remainder - size unknown until parse time
            this.value = new Uint8Array(0);
        }
    }

    /**
     * Size of this bytes node.
     * 
     * @returns
     * - `source.byteLength` if source is `Uint8Array`
     * - `<number>` if source is `number`
     * - `0` if source is `null` (lazy)
     */
    get size(): number {
        if (this.source instanceof Uint8Array)
            return this.source.byteLength;
        if (typeof this.source === "number")
            return this.source

        // lazy and remainder: unknown until resolved
        return this.value.byteLength;
    }

    _load(buffer: Uint8Array, offset: number, remaining: number): void {
        let length: number;

        if (this.source instanceof Uint8Array) {
            length = this.source.byteLength;
        } else if (typeof this.source === "number") {
            length = this.source;
        } else if (typeof this.source === "function") {
            length = this.source();
        } else if (this.source instanceof SizeofRef) {
            throw new Error(`sizeof("${this.source.name}") was not resolved before load`);
        } else {
            length = remaining; // null -> consume remainder
        }

        this.value = buffer.slice(offset, offset + length);
        this.source = length;
    }
}

/**
 * Holds a raw binary blob.
 */
export function bytes(source?: Uint8Array | number | (() => number) | SizeofRef): BytesNode {
    return new BytesNode(source ?? null);
}