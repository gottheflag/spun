/**
 * Copyright (c) 2026 GTF
 * SPDX-License-Identifier: Apache-2.0
 */

export class SizeofRef {
    constructor(readonly name: string) {}
}

/**
 * Scheme-only, a lazy size reference that resolves
 * to the parsed value of the named `field()` when `load()` is called.
 * 
 * @param name field name
 * @returns SizeofRef
 */
export function sizeof(name: string): SizeofRef {
    return new SizeofRef(name);
}