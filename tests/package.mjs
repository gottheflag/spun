import assert from "node:assert/strict";

import {
	emit,
	field,
	layout,
	scheme,
	section,
	tag,
	u8,
} from "@gottheflag/spun";

import {
	layout as subpathLayout,
} from "@gottheflag/spun/layout";

import {
	section as subpathSection,
	tag as subpathTag,
	u8 as subpathU8,
} from "@gottheflag/spun/node";

import {
	field as subpathField,
	scheme as subpathScheme,
} from "@gottheflag/spun/scheme";

const rootBytes = emit(
	layout(
		section(
			"header",
			tag("SPUN"),
			u8(1),
		),
	),
);

assert.deepEqual(
	rootBytes,
	Uint8Array.of(
		0x53,
		0x50,
		0x55,
		0x4e,
		0x01,
	),
);

const format = subpathScheme(
	subpathSection(
		"header",
		subpathField(
			"magic",
			subpathTag(4),
		),
		subpathField(
			"version",
			subpathU8(),
		),
	),
);

const subpathBytes = emit(
	subpathLayout(
		subpathSection(
			"header",
			subpathTag("SPUN"),
			subpathU8(1),
		),
	),
);

const parsed = format.load(subpathBytes);

assert.equal(
	parsed.get("header.magic").value,
	"SPUN",
);

assert.equal(
	parsed.get("header.version").value,
	1,
);

// Also ensure the root scheme API remains functional.
assert.equal(
	scheme(
		section(
			"header",
			field("version", u8()),
		),
	).load(Uint8Array.of(1))
		.get("header.version").value,
	1,
);