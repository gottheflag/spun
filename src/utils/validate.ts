/**
 * Copyright (c) 2026 GTF
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Valid names:
 * - A-z (capital and lowercase, case-insensitive)
 * - 0-9 (numbers)
 * - `_` (underscore)
 * - `-` (hyphen)
 * - Max 1024 characters
 */
const VALID_NAME = /^[A-Za-z0-9_-]{1,1024}$/;

export function validateName(name: string, context: string): void {
    if (!VALID_NAME.test(name)) {
        throw new Error(
            `${context}: invalid name "${name}" must match "A-z0-9_-" (min: 1, max: 1024)`
        );
    }
}