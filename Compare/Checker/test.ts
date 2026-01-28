import { describe, it } from "node:test"
import { expect } from "expect"
import { Checker, Opinion } from "../pure.ts"
import { Pipe } from "../../Lib/pure.ts"

await describe("Checker", async () => {
	await it("Whitelist extension", () => {
		const checker = Checker.AsksWhen(([x, y]) => x.endsWith(".ts") && y.endsWith(".ts"), Checker.Allow())
		expect(Opinion.Allow()).toEqual(checker(["a.ts", "b.ts"]))
		expect(Opinion.Pure(undefined)).toEqual(checker(["a.foo", "b.ts"]))
		expect(Opinion.Pure(undefined)).toEqual(checker(["a.ts", "b.foo"]))
		expect(Opinion.Pure(undefined)).toEqual(checker(["a.foo", "b.foo"]))
	})

	await it("Blacklist extension", () => {
		const checker = Checker.AsksWhen(([x, y]) => x.endsWith(".ts") && y.endsWith(".ts"), Checker.Error("Deny"))
		expect(Opinion.Error("Deny")).toEqual(checker(["a.ts", "b.ts"]))
		expect(Opinion.Pure(undefined)).toEqual(checker(["a.foo", "b.ts"]))
		expect(Opinion.Pure(undefined)).toEqual(checker(["a.ts", "b.foo"]))
		expect(Opinion.Pure(undefined)).toEqual(checker(["a.foo", "b.foo"]))
	})

	await it("Filter Extension", () => {
		const checker = Checker.IfM(
			Checker.Asks(([x, y]) => x.endsWith(".ts") && y.endsWith(".ts")),
			Checker.Allow(),
			Checker.Error("Deny"),
		)
		expect(Opinion.Allow()).toEqual(checker(["a.ts", "b.ts"]))
		expect(Opinion.Error("Deny")).toEqual(checker(["a.ts", "b.zz"]))
		expect(Opinion.Error("Deny")).toEqual(checker(["a.zz", "b.ts"]))
		expect(Opinion.Error("Deny")).toEqual(checker(["a.zz", "b.zz"]))
	})

	await it("Alternative Filter", () => {
		const checker = Pipe(
			Checker.AsksWhen(([x, y]) => x.endsWith(".ts") && y.endsWith(".ts"), Checker.Allow()),
			Checker.Then(Checker.AsksWhen(([x, y]) => x.endsWith(".moo"), Checker.Allow())),
			Checker.Then(Checker.Error("Deny")),
		)
		expect(Opinion.Allow()).toEqual(checker(["a.ts", "b.ts"]))
		expect(Opinion.Error("Deny")).toEqual(checker(["a.ts", "b.zz"]))
		expect(Opinion.Error("Deny")).toEqual(checker(["a.zz", "b.ts"]))
		expect(Opinion.Error("Deny")).toEqual(checker(["a.zz", "b.zz"]))

		expect(Opinion.Allow()).toEqual(checker(["a.moo", "b.ts"]))
		expect(Opinion.Allow()).toEqual(checker(["a.moo", "b.moo"]))
		expect(Opinion.Error("Deny")).toEqual(checker(["a.ts", "b.moo"]))
	})
})
