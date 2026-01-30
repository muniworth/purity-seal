import { describe, it } from "node:test"
import { expect } from "expect"
import { Checker } from "../nodejs.ts"
import { Pipe } from "../Lib/pure.ts"

await describe("Checker", async () => {
	await it("Whitelist extension", () => {
		const checker = Checker.AsksWhen(
			([x, y]) => x.endsWith(".ts") && y.endsWith(".ts"),
			Checker.Allow(),
		)
		expect(Checker.Opinion.Allow()).toEqual(checker(["a.ts", "b.ts"]))
		expect(Checker.Opinion.Pure(undefined)).toEqual(checker(["a.foo", "b.ts"]))
		expect(Checker.Opinion.Pure(undefined)).toEqual(checker(["a.ts", "b.foo"]))
		expect(Checker.Opinion.Pure(undefined)).toEqual(checker(["a.foo", "b.foo"]))
	})

	await it("Blacklist extension", () => {
		const checker = Checker.AsksWhen(
			([x, y]) => x.endsWith(".ts") && y.endsWith(".ts"),
			Checker.Deny(),
		)
		expect(Checker.Opinion.Deny(["a.ts", "b.ts"])).toEqual(checker(["a.ts", "b.ts"]))
		expect(Checker.Opinion.Pure(undefined)).toEqual(checker(["a.foo", "b.ts"]))
		expect(Checker.Opinion.Pure(undefined)).toEqual(checker(["a.ts", "b.foo"]))
		expect(Checker.Opinion.Pure(undefined)).toEqual(checker(["a.foo", "b.foo"]))
	})

	await it("Filter extension", () => {
		const checker = Checker.IfM(
			Checker.Asks(([x, y]) => x.endsWith(".ts") && y.endsWith(".ts")),
			Checker.Allow(),
			Checker.Deny(),
		)
		expect(Checker.Opinion.Allow()).toEqual(checker(["a.ts", "b.ts"]))
		expect(Checker.Opinion.Deny(["a.ts", "b.zz"])).toEqual(checker(["a.ts", "b.zz"]))
		expect(Checker.Opinion.Deny(["a.zz", "b.ts"])).toEqual(checker(["a.zz", "b.ts"]))
		expect(Checker.Opinion.Deny(["a.zz", "b.zz"])).toEqual(checker(["a.zz", "b.zz"]))
	})

	await it("Alternative filter", () => {
		const checker = Pipe(
			Checker.AsksWhen(
				([x, y]) => x.endsWith(".ts") && y.endsWith(".ts"),
				Checker.Allow(),
			),
			Checker.Then(Checker.AsksWhen(
				([x, y]) => x.endsWith(".moo"),
				Checker.Allow()),
			),
			Checker.Then(Checker.Deny()),
		)
		expect(Checker.Opinion.Allow()).toEqual(checker(["a.ts", "b.ts"]))
		expect(Checker.Opinion.Deny(["a.ts", "b.zz"])).toEqual(checker(["a.ts", "b.zz"]))
		expect(Checker.Opinion.Deny(["a.zz", "b.ts"])).toEqual(checker(["a.zz", "b.ts"]))
		expect(Checker.Opinion.Deny(["a.zz", "b.zz"])).toEqual(checker(["a.zz", "b.zz"]))

		expect(Checker.Opinion.Allow()).toEqual(checker(["a.moo", "b.ts"]))
		expect(Checker.Opinion.Allow()).toEqual(checker(["a.moo", "b.moo"]))
		expect(Checker.Opinion.Deny(["a.ts", "b.moo"])).toEqual(checker(["a.ts", "b.moo"]))
	})
})
