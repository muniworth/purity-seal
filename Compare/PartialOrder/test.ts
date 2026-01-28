
import { describe, it } from "node:test"
import { expect } from "expect"

import { Result } from "../../Lib/pure.ts"
import { Compare } from "../../nodejs.ts"

await describe("Diamond: cache, http, state, pure", async () => {
	await it("Deny cycle", () => {
		const po = Compare.PartialOrder.Make([
			["pure", "state", "pure"],
		])
		expect(po).toEqual(Result.Error("ClassifyAndCompare: orderRules induce a cycle"))
	})
})
