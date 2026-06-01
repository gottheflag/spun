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
	target: "es2022",
	dts: true,
	clean: true,
	bundle: true,
	minify: true,
	sourcemap: true,
	splitting: false,
	outExtension: () => ({ js: ".js" })
});