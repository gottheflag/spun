/**
 * Copyright (c) 2026 GTF
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutNode } from "./node.js"

export type LayoutNodeConstructor = new (...args: any[]) => LayoutNode;

const registry = new Map<string, LayoutNodeConstructor>();

/**
 * Register a custom node type.
 * 
 * ---
 * 
 * @example
 * ```
 * class XYZNode extends LayoutNode {
 *   readonly size = 4;
 *   
 *   constructor(...) {
 *     super();
 *   }
 * 
 *   _emit(view, offset) {
 *     // write bytes to view
 *   }
 * 
 *   _load(buffer, offset) {
 *     // load bytes from buffer (for scheme parsing)
 *   }
 * 
 *   _inspect() {
 *     return {
 *       type: "xyz",
 *       label: "XYZ(...)",
 *       value: ...
 *     };
 *   }
 * 
 *   static fromInspect(node) {
 *     // restore from serialized JSON
 *   }
 * }
 * 
 * registerNode("xyz", XYZNode);
 * ```
 * 
 * @param key 
 * @param ctor 
 */
export function registerNode(key: string, ctor: LayoutNodeConstructor): void {
    if (registry.has(key)) {
        throw new Error(`registerNode: key "${key}" is already registered`);
    }

    registry.set(key, ctor);
}

export function resolveNode(key: string): LayoutNodeConstructor | undefined {
    return registry.get(key);
}

export function isRegistered(key: string): boolean {
    return registry.has(key);
}