import { describe, it } from "node:test"
import { expect } from "expect"

import * as PS from "../nodejs.ts"

await describe("Diamond: cache, http, state, pure", async () => {
	const classify = PS.Classify.File.FromExtensions(["pure", "state", "http"])
	const check = PS.Pipe(
		PS.Compare.PartialOrder.Make([
			[["http.state", "state.http"], ["state", "http"], "pure"],
		]),
		PS.Compare.BuildChecker(classify),
		PS.Result.GetOrThrow,
	)

	await it("Allow diamond", () => {
		expect(check(["http.ts", "Root.pure.ts"])).toEqual(PS.Compare.Opinion.Allow())
		expect(check(["state.ts", "Root.pure.ts"])).toEqual(PS.Compare.Opinion.Allow())
		expect(check(["Leaf.http.state.ts", "http.ts"])).toEqual(PS.Compare.Opinion.Allow())
		expect(check(["Leaf.http.state.ts", "state.ts"])).toEqual(PS.Compare.Opinion.Allow())
		expect(check(["Leaf.state.http.ts", "http.ts"])).toEqual(PS.Compare.Opinion.Allow())
		expect(check(["Leaf.state.http.ts", "state.ts"])).toEqual(PS.Compare.Opinion.Allow())
	})

	await it("Enforce purity", () => {
		expect(check(["Root.pure.ts", "http.ts"])).toEqual(PS.Compare.Opinion.Deny(["Root.pure.ts", "http.ts"]))
		expect(check(["Root.pure.ts", "state.ts"])).toEqual(PS.Compare.Opinion.Deny(["Root.pure.ts", "state.ts"]))
		expect(check(["http.ts", "Leaf.http.state.ts"])).toEqual(PS.Compare.Opinion.Deny(["http.ts", "Leaf.http.state.ts"]))
		expect(check(["http.ts", "Leaf.state.http.ts"])).toEqual(PS.Compare.Opinion.Deny(["http.ts", "Leaf.state.http.ts"]))
		expect(check(["state.ts", "Leaf.http.state.ts"])).toEqual(PS.Compare.Opinion.Deny(["state.ts", "Leaf.http.state.ts"]))
		expect(check(["state.ts", "Leaf.state.http.ts"])).toEqual(PS.Compare.Opinion.Deny(["state.ts", "Leaf.state.http.ts"]))
	})
})
