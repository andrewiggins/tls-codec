import { readFileSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { createParserSrc } from "../src/index.js";

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

for (let inFilePath of args.positionals) {
	const outFilePath = inFilePath.replace(/\.d\.ts$/, ".parser.ts");

	console.log(`Processing ${inFilePath}`);
	const src = readFileSync(inFilePath, "utf-8");
	const newSrc = createParserSrc(src);
	writeFileSync(outFilePath, newSrc);
}
