/**
 * Copyright (c) 2026 GTF
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutNode } from "../layout/node.js";
import { AlignNode, BytesNode, I16Node, I32Node, I8Node, PadNode, RefNode, ReserveNode, U16Node, U32Node, U8Node } from "../node/index.js";
import { TagNode } from "../node/tag.js";
import { FieldNode } from "../scheme/field.js";

export function nodeType(node: LayoutNode): string {
    if (node instanceof FieldNode) return nodeType(node.inner);
    if (node instanceof TagNode) return "tag";
    if (node instanceof U8Node) return "u8";
    if (node instanceof U16Node) return "u16";
    if (node instanceof U32Node) return "u32";
    if (node instanceof I8Node) return "i8";
    if (node instanceof I16Node) return "i16";
    if (node instanceof I32Node) return "i32";
    if (node instanceof BytesNode) return "bytes";
    if (node instanceof PadNode) return "pad";
    if (node instanceof AlignNode) return "align";
    if (node instanceof RefNode) return "ref";
    if (node instanceof ReserveNode) return `reserve.u${node.size * 8}`;

    return node._inspect().type;
}

export function nodeLabel(node: LayoutNode): string {
    if (node instanceof FieldNode) return `${nodeLabel(node.inner)} (${node.name})`;
    if (node instanceof TagNode) return `Tag("${node.value}")`;
    if (node instanceof U8Node) return `U8(${node.value})`;
    if (node instanceof U16Node) return `U16(${node.value})`;
    if (node instanceof U32Node) return `U32(${node.value})`;
    if (node instanceof I8Node) return `I8(${node.value})`;
    if (node instanceof I16Node) return `I16(${node.value})`;
    if (node instanceof I32Node) return `I32(${node.value})`;
    if (node instanceof BytesNode) return `Bytes(${node.size})`;
    if (node instanceof PadNode) return `Pad(${node.size})`;
    if (node instanceof AlignNode) return `Align(${node.boundary})`;
    if (node instanceof RefNode) return `Ref(${node.resolvedValue})`;
    if (node instanceof ReserveNode) return `Reserve.U${node.size * 8}(${node.value})`;

    return node._inspect().label;
}

export function nodeValue(node: LayoutNode): unknown {
    if (node instanceof FieldNode) return nodeValue(node.inner);
    if (node instanceof TagNode) return node.value;
    if (node instanceof U8Node) return node.value;
    if (node instanceof U16Node) return node.value;
    if (node instanceof U32Node) return node.value;
    if (node instanceof I8Node) return node.value;
    if (node instanceof I16Node) return node.value;
    if (node instanceof I32Node) return node.value;
    if (node instanceof BytesNode) return Array.from(node.value);
    if (node instanceof PadNode) return null;
    if (node instanceof AlignNode) return null;
    if (node instanceof RefNode) return node.resolvedValue;
    if (node instanceof ReserveNode) return node.value;
    
    return node._inspect().value;
}