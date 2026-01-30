import { describe, it } from "node:test"
import { expect } from "expect"

import * as PS from "../nodejs.ts"

await describe("Onion architecture diamond: cache, http, state, pure", async () => {
	const classify = PS.Classify.Extensions(["pure", "state", "http"])
	const po = PS.PartialOrder.Make([
		[["http.state", "state.http"], ["state", "http"], "pure"],
	])
	const check = PS.Pipe(
		PS.Checker.Build(classify)(po),
		PS.Result.GetOrThrow,
	)

	await it("Allow diamond", () => {
		expect(check(["http.ts", "Root.pure.ts"])).toEqual(PS.Checker.Opinion.Allow())
		expect(check(["state.ts", "Root.pure.ts"])).toEqual(PS.Checker.Opinion.Allow())
		expect(check(["Leaf.http.state.ts", "http.ts"])).toEqual(PS.Checker.Opinion.Allow())
		expect(check(["Leaf.http.state.ts", "state.ts"])).toEqual(PS.Checker.Opinion.Allow())
		expect(check(["Leaf.state.http.ts", "http.ts"])).toEqual(PS.Checker.Opinion.Allow())
		expect(check(["Leaf.state.http.ts", "state.ts"])).toEqual(PS.Checker.Opinion.Allow())
	})

	await it("Enforce purity", () => {
		expect(check(["Root.pure.ts", "http.ts"])).toEqual(PS.Checker.Opinion.Deny(["Root.pure.ts", "http.ts"]))
		expect(check(["Root.pure.ts", "state.ts"])).toEqual(PS.Checker.Opinion.Deny(["Root.pure.ts", "state.ts"]))
		expect(check(["http.ts", "Leaf.http.state.ts"])).toEqual(PS.Checker.Opinion.Deny(["http.ts", "Leaf.http.state.ts"]))
		expect(check(["http.ts", "Leaf.state.http.ts"])).toEqual(PS.Checker.Opinion.Deny(["http.ts", "Leaf.state.http.ts"]))
		expect(check(["state.ts", "Leaf.http.state.ts"])).toEqual(PS.Checker.Opinion.Deny(["state.ts", "Leaf.http.state.ts"]))
		expect(check(["state.ts", "Leaf.state.http.ts"])).toEqual(PS.Checker.Opinion.Deny(["state.ts", "Leaf.state.http.ts"]))
	})
})
