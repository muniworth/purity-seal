import { describe, it } from "node:test"
import { expect } from "expect"

import * as PS from "../nodejs.ts"

await describe("Diamond: cache, http, state, pure", async () => {
	const classify = PS.Classify.File.FromExtensions(["browser", "pure", "state", "http"])
	const po = PS.Compare.PartialOrder.Make([
		["browser", ["state", "http"], "pure"],
	])
	const check = PS.Pipe(
		PS.Compare.ClassifyAndCompare(classify, po),
		PS.Result.GetOrThrow,
	)

	await it("Allow diamond", () => {
		expect(check(["http.ts", "Root.pure.ts"])).toEqual(PS.Compare.Opinion.Allow())
		expect(check(["state.ts", "Root.pure.ts"])).toEqual(PS.Compare.Opinion.Allow())
		expect(check(["Leaf.browser.ts", "http.ts"])).toEqual(PS.Compare.Opinion.Allow())
		expect(check(["Leaf.browser.ts", "state.ts"])).toEqual(PS.Compare.Opinion.Allow())
	})

	await it("Enforce purity", () => {
		expect(check(["Root.pure.ts", "http.ts"])).toEqual(PS.Compare.Opinion.Deny(["Root.pure.ts", "http.ts"]))
		expect(check(["Root.pure.ts", "state.ts"])).toEqual(PS.Compare.Opinion.Deny(["Root.pure.ts", "state.ts"]))
		expect(check(["http.ts", "Leaf.browser.ts"])).toEqual(PS.Compare.Opinion.Deny(["http.ts", "Leaf.browser.ts"]))
		expect(check(["state.ts", "Leaf.browser.ts"])).toEqual(PS.Compare.Opinion.Deny(["state.ts", "Leaf.browser.ts"]))
	})
})
