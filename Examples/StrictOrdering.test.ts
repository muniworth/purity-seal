import { describe, it } from "node:test"
import { expect } from "expect"

import * as PS from "../nodejs.ts"

await describe("Strict Ordering: math -> domain -> pure", async () => {
	const classify = PS.Classify.Extensions(["pure", "math", "domain"])
	const po = PS.PartialOrder.Make([
		["math", "domain", "pure"],
	])
	const check = PS.Checker.Build(classify)(po)

	await it("Allow valid ordering", () => {
		expect(check(["Foo.pure.ts", "Bar.pure.ts"])).toEqual(PS.Checker.Opinion.Allow())
		expect(check(["Foo.domain.ts", "Bar.pure.ts"])).toEqual(PS.Checker.Opinion.Allow())
		expect(check(["Foo.domain.ts", "Bar.domain.ts"])).toEqual(PS.Checker.Opinion.Allow())
		expect(check(["Foo.math.ts", "Bar.pure.ts"])).toEqual(PS.Checker.Opinion.Allow())
		expect(check(["Foo.math.ts", "Bar.domain.ts"])).toEqual(PS.Checker.Opinion.Allow())
		expect(check(["Foo.math.ts", "Bar.math.ts"])).toEqual(PS.Checker.Opinion.Allow())
	})

	await it("Deny invalid ordering", () => {
		expect(check(["Bar.pure.ts", "Foo.domain.ts"])).toEqual(PS.Checker.Opinion.Deny(["Bar.pure.ts", "Foo.domain.ts"]))
		expect(check(["Bar.pure.ts", "Foo.math.ts"])).toEqual(PS.Checker.Opinion.Deny(["Bar.pure.ts", "Foo.math.ts"]))
		expect(check(["Bar.domain.ts", "Foo.math.ts"])).toEqual(PS.Checker.Opinion.Deny(["Bar.domain.ts", "Foo.math.ts"]))
	})
})
