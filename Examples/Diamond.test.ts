import { describe, it } from "node:test"
import { expect } from "expect"

import * as PS from "../nodejs.ts"

await describe("Diamond: cache, http, state, pure", async () => {
	const classify = PS.Classify.File.FromExtensions(["http.state", "pure", "state", "http"])
	const po = PS.Compare.PartialOrder.Make([
		["http.state", ["state", "http"], "pure"],
	])
	const check = PS.Pipe(
		PS.Compare.ClassifyAndCompare(classify, po),
		PS.Result.GetOrThrow,
	)

	await it("Allow diamond", () => {
		expect(check(["http.ts", "Root.pure.ts"])).toEqual(PS.Compare.Opinion.Allow())
		expect(check(["state.ts", "Root.pure.ts"])).toEqual(PS.Compare.Opinion.Allow())
		expect(check(["Leaf.http.state.ts", "http.ts"])).toEqual(PS.Compare.Opinion.Allow())
		expect(check(["Leaf.http.state.ts", "state.ts"])).toEqual(PS.Compare.Opinion.Allow())
	})

	await it("Enforce purity", () => {
		expect(check(["Root.pure.ts", "http.ts"])).toEqual(PS.Compare.Opinion.Deny(["Root.pure.ts", "http.ts"]))
		expect(check(["Root.pure.ts", "state.ts"])).toEqual(PS.Compare.Opinion.Deny(["Root.pure.ts", "state.ts"]))
		expect(check(["http.ts", "Leaf.http.state.ts"])).toEqual(PS.Compare.Opinion.Deny(["http.ts", "Leaf.http.state.ts"]))
		expect(check(["state.ts", "Leaf.http.state.ts"])).toEqual(PS.Compare.Opinion.Deny(["state.ts", "Leaf.http.state.ts"]))
	})
})
