import { test } from "uvu";
import * as assert from "uvu/assert";
import { createParserSrc } from "../src/index.js";

test("should pass", () => {
	const inSrc = "source";
	assert.equal(createParserSrc(inSrc), inSrc);
});

test.run();
