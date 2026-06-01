import { defineConfig } from "tsup";

export default defineConfig({
	entry: [
		"src/index.ts",
		"src/scheme/index.ts",
		"src/node/index.ts",
		"src/layout/index.ts",
		"src/inspect/index.ts"
	],
	format: ["esm"],
	dts: true,
	clean: true
});