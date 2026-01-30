import { describe, it } from "node:test"
import { expect } from "expect"

import * as PS from "../nodejs.ts"

await describe("Alternative Checkers", async () => {
	const whitelist = new Set(["Source/Legacy/Foo.ts"])
	const allowWhitelist = PS.Checker.AsksWhen(
		([x, y]) => whitelist.has(x) || whitelist.has(y),
		PS.Checker.Allow(),
	)
	const classify = PS.Pipe(
		PS.Classify.Extensions(["pure", "http"]),
	)
	const po = PS.PartialOrder.Make([
		["http", "pure"],
	])
	const check = PS.Pipe(
		PS.Checker.Build(classify)(po),
		PS.Checker.Then(allowWhitelist),
	)

	await it("Classifies external code", () => {
		expect(check(["pure.ts", "Source/Legacy/Foo.ts"])).toEqual(PS.Checker.Opinion.Allow())
		expect(check(["http.ts", "Source/Legacy/Foo.ts"])).toEqual(PS.Checker.Opinion.Allow())
		expect(check(["Source/Legacy/Foo.ts", "pure.ts"])).toEqual(PS.Checker.Opinion.Allow())
		expect(check(["Source/Legacy/Foo.ts", "http.ts"])).toEqual(PS.Checker.Opinion.Allow())
		expect(check(["http.ts", "pure.ts"])).toEqual(PS.Checker.Opinion.Allow())
		expect(check(["pure.ts", "http.ts"])).toEqual(PS.Checker.Opinion.Deny(["pure.ts", "http.ts"]))
	})
})
