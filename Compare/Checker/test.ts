import { describe, it } from "node:test"
import { expect } from "expect"
import { Compare } from "../../nodejs.ts"
import { Pipe } from "../../Lib/pure.ts"

await describe("Checker", async () => {
	await it("Whitelist extension", () => {
		const checker = Compare.Checker.AsksWhen(
			([x, y]) => x.endsWith(".ts") && y.endsWith(".ts"),
			Compare.Checker.Allow(),
		)
		expect(Compare.Opinion.Allow()).toEqual(checker(["a.ts", "b.ts"]))
		expect(Compare.Opinion.Pure(undefined)).toEqual(checker(["a.foo", "b.ts"]))
		expect(Compare.Opinion.Pure(undefined)).toEqual(checker(["a.ts", "b.foo"]))
		expect(Compare.Opinion.Pure(undefined)).toEqual(checker(["a.foo", "b.foo"]))
	})

	await it("Blacklist extension", () => {
		const checker = Compare.Checker.AsksWhen(
			([x, y]) => x.endsWith(".ts") && y.endsWith(".ts"),
			Compare.Checker.Deny(),
		)
		expect(Compare.Opinion.Deny(["a.ts", "b.ts"])).toEqual(checker(["a.ts", "b.ts"]))
		expect(Compare.Opinion.Pure(undefined)).toEqual(checker(["a.foo", "b.ts"]))
		expect(Compare.Opinion.Pure(undefined)).toEqual(checker(["a.ts", "b.foo"]))
		expect(Compare.Opinion.Pure(undefined)).toEqual(checker(["a.foo", "b.foo"]))
	})

	await it("Filter Extension", () => {
		const checker = Compare.Checker.IfM(
			Compare.Checker.Asks(([x, y]) => x.endsWith(".ts") && y.endsWith(".ts")),
			Compare.Checker.Allow(),
			Compare.Checker.Deny(),
		)
		expect(Compare.Opinion.Allow()).toEqual(checker(["a.ts", "b.ts"]))
		expect(Compare.Opinion.Deny(["a.ts", "b.zz"])).toEqual(checker(["a.ts", "b.zz"]))
		expect(Compare.Opinion.Deny(["a.zz", "b.ts"])).toEqual(checker(["a.zz", "b.ts"]))
		expect(Compare.Opinion.Deny(["a.zz", "b.zz"])).toEqual(checker(["a.zz", "b.zz"]))
	})

	await it("Alternative Filter", () => {
		const checker = Pipe(
			Compare.Checker.AsksWhen(
				([x, y]) => x.endsWith(".ts") && y.endsWith(".ts"),
				Compare.Checker.Allow(),
			),
			Compare.Checker.Then(Compare.Checker.AsksWhen(
				([x, y]) => x.endsWith(".moo"),
				Compare.Checker.Allow()),
			),
			Compare.Checker.Then(Compare.Checker.Deny()),
		)
		expect(Compare.Opinion.Allow()).toEqual(checker(["a.ts", "b.ts"]))
		expect(Compare.Opinion.Deny(["a.ts", "b.zz"])).toEqual(checker(["a.ts", "b.zz"]))
		expect(Compare.Opinion.Deny(["a.zz", "b.ts"])).toEqual(checker(["a.zz", "b.ts"]))
		expect(Compare.Opinion.Deny(["a.zz", "b.zz"])).toEqual(checker(["a.zz", "b.zz"]))

		expect(Compare.Opinion.Allow()).toEqual(checker(["a.moo", "b.ts"]))
		expect(Compare.Opinion.Allow()).toEqual(checker(["a.moo", "b.moo"]))
		expect(Compare.Opinion.Deny(["a.ts", "b.moo"])).toEqual(checker(["a.ts", "b.moo"]))
	})
})
