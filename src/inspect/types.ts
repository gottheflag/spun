/**
 * Copyright (c) 2026 GTF
 * SPDX-License-Identifier: Apache-2.0
 */

export type Inspector = InspectorNode[];

export type InspectorNode =
    | InspectorSection
    | InspectorLeaf;

export interface InspectorSection {
    kind: "section";
    name: string;
    offset: number;
    size: number;
    nodes: InspectorNode[];
}

export interface InspectorLeaf {
    kind: "leaf";
    type: string;
    label: string;
    offset: number;
    size: number;
    value: unknown;
}