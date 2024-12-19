import { parseArgs } from "node:util";
import { createParsers } from "../src/index.js";

const args = parseArgs({
	allowPositionals: true,
});

console.log(args);

// Validate arguments
if (args.positionals.length === 0) {
	console.error("Usage: tsl-codec <file1> <file2> ...");
	process.exit(1);
}

for (let filePath of args.positionals) {
	if (!filePath.endsWith(".d.ts")) {
		console.error("Only .d.ts files are supported");
		process.exit(1);
	}
}

// Run compiler

// https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#writing-an-incremental-program-watcher

createParsers(args.positionals);
