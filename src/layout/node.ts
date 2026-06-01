/**
 * Copyright (c) 2026 GTF
 * SPDX-License-Identifier: Apache-2.0
 */

import { scheme } from "../scheme/scheme.js";

/**
 * Required data for an inspector object.
 * Returned by `_inspect()` on any `LayoutNode`.
 */
export interface CustomInspect {
	/**
	 * Machine-readable node type identifier,
	 * must be unique across all registered custom nodes.
	 * Used by `serialize()` to reconstruct the node from JSON.
	 * 
	 * @example `crc32`, `zlib`
	 */
	type: string;

	/**
	 * Human-readable description of the node and its current value.
	 * 
	 * @example `CRC32(0xdeadbeef), `XOR(42, key=255)`
	 */
	label: string;

	/**
	 * The node's current value in a JSON-serializable form.
	 * Stored in the `Inspector` tree and passed to `fromInspect()`
	 * during `serialize()`.
	 * 
	 * Use a plain number, string, array, or object (never a class instances).
	 */
	value: unknown;
}

export abstract class LayoutNode {
	/**
	 * Byte length of this node in final form.
	 * Must be a fixed, known value at construction time, except
	 * for `AlignNode` (computed during resolution) and
	 * lazy/remainder `BytesNode` (computed during `scheme.load()`).
	 */
	abstract readonly size: number;

	/**
	 * Invoked when `scheme.load` is called for each node
	 * 
	 * @see {@link scheme}
	 * 
	 * ---
	 * 
	 * @example
	 * 
	 * o = offset (current read position)
	 * r = remaining
	 * . = (bytes)
	 * 
	 * . . . . . . . . . . . . . .
	 *       ^ ^-----------------^
	 *       o         r
	 * 
	 * @param _buffer The data buffer
	 * @param _offset The starting offset
	 * @param _remaining How many bytes remain in the buffer
	 */
	_load(_buffer: Uint8Array, _offset: number, _remaining: number): void {
		// no-op: override in custom nodes
	}

	/**
	 * Write this node's bytes into `view` at `offset`.
	 * 
	 * @param view
	 * @param offset
	 */
	_emit(_view: DataView, _offset: number): void {
		// no-op: override in custom nodes
	}

	/**
	 * Return a JSON-serializable tree describing the node's current state.
	 */
	_inspect(): CustomInspect {
		return {
			type: "custom",
			label: this.constructor.name.toLowerCase(),
			value: null
		};
	}
}