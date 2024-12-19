import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import prettier from "prettier";
import { test } from "uvu";
import * as assert from "uvu/assert";

import { createParsers } from "../src/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const p = (...args: string[]) => path.join(__dirname, ...args);

const readFixture = (path: string) =>
	readFile(p(`fixtures/${path}`), "utf8").then((code) =>
		prettier.format(code, { parser: "typescript" }),
	);

test("basic", async () => {
	await createParsers([p("fixtures/basic/input.d.ts")]);
	const actual = await readFixture("basic/input.parser.ts");
	const expected = await readFixture("basic/expected.ts");
	assert.fixture(actual, expected);
});

test.run();
