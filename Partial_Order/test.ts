
import { describe, it } from "node:test"
import { expect } from "expect"

import { Result } from "../Lib/pure.ts"
import { PartialOrder } from "./pure.ts"

await describe("Diamond: cache, http, state, pure", async () => {
	await it("Deny cycle", () => {
		const po = PartialOrder.Make([
			["pure", "state", "pure"],
		])
		expect(po).toEqual(Result.Error("Partial order rules induce a cycle"))
	})
})
