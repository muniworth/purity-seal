import { describe, it } from "node:test"
import { expect } from "expect"

import { Result } from "../Lib/pure.ts"
import { Classify, Compare } from "../nodejs.ts"

await describe("Diamond: cache, http, state, pure", async () => {
	const checker = Result.GetOrThrow(Compare.ClassifyAndCompare(
		Classify.File.FromExtensions(["http.state", "pure", "state", "http"]),
		[
			["http.state", "state", "pure"],
			["http.state", "http", "pure"],
		],
	))

	await it("Allows diamond", () => {
		expect(checker(["http.ts", "Root.pure.ts"])).toEqual(Compare.Opinion.Allow())
		expect(checker(["state.ts", "Root.pure.ts"])).toEqual(Compare.Opinion.Allow())
		expect(checker(["Leaf.http.state.ts", "http.ts"])).toEqual(Compare.Opinion.Allow())
		expect(checker(["Leaf.http.state.ts", "state.ts"])).toEqual(Compare.Opinion.Allow())
	})

	await it("Enforces purity", () => {
		expect(checker(["Root.pure.ts", "http.ts"])).toEqual(Compare.Opinion.Deny(["Root.pure.ts", "http.ts"]))
		expect(checker(["Root.pure.ts", "state.ts"])).toEqual(Compare.Opinion.Deny(["Root.pure.ts", "state.ts"]))
		expect(checker(["http.ts", "Leaf.http.state.ts"])).toEqual(Compare.Opinion.Deny(["http.ts", "Leaf.http.state.ts"]))
		expect(checker(["state.ts", "Leaf.http.state.ts"])).toEqual(Compare.Opinion.Deny(["state.ts", "Leaf.http.state.ts"]))
	})
})
