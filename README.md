<p align="center">
  <img src="./docs/assets/logo.png" alt="spun" width="120" />
</p>

<h3 align="center">spun</h3>
<p align="center">Composable binary layouts, inspection, and schemes.</p>

[![Socket Badge](https://badge.socket.dev/npm/package/@gottheflag/spun/0.1.0-beta.3)](https://badge.socket.dev/npm/package/@gottheflag/spun/0.1.0-beta.3)

<br />

## What is it?

spun is a retained binary layout engine. Instead of writing bytes immediately, you build an in-memory graph of typed nodes — then resolve, inspect, edit, and emit whenever you're ready.

```ts
import { layout, section, tag, u16, u32, reserve, emit } from "@gottheflag/spun";

const fileSize = reserve.u32();

const file = layout(
  section("header",
    tag("EXE"),
    fileSize,
    u16(1),
  ),
);

fileSize.set(emit(file).byteLength);
const buf = emit(file);
```

## Features

- **Retained graph** — construct now, emit later.
- **Schemes** — parse any binary file into a named, inspectable layout.
- **Symbolic refs** — `ref(node)` resolves to byte offsets automatically.
- **Deferred values** — `reserve.u32()` for checksums, sizes, and patches.
- **Inspection** — `inspect()` returns a full JSON-serializable tree.
- **Extensible** — subclass `LayoutNode` to create custom node types.
- **Zero dependencies** — no runtime deps, works everywhere.

## Install

```sh
npm install @gottheflag/spun
```

## Documentation

Full API reference and guides at [gottheflag.github.io/spun](https://gottheflag.github.io/spun/).

## License

Apache 2.0
