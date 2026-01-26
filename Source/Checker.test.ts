import { describe, it } from "node:test"
import { expect } from "expect"
import { Checker, ClassifyAndCompare } from "./pure.ts"
import { Pipe } from "../Lib/pure.ts"

await describe("Checker", async () => {

	await it("Empty", () => {
		const checker: Checker<void> = ClassifyAndCompare(
			[],
			[],
		)
		const out = checker("a.foo", "b.foo")
		expect(out).toEqual(Checker.resultPure(undefined))
	})

	await it("Whitelist extension", () => {
		const checker = Checker.AsksWhen((x, y) => x.endsWith(".ts") && y.endsWith(".ts"), Checker.Allow())
		expect(Checker.resultAllow()).toEqual(checker("a.ts", "b.ts"))
		expect(Checker.resultPure(undefined)).toEqual(checker("a.foo", "b.ts"))
		expect(Checker.resultPure(undefined)).toEqual(checker("a.ts", "b.foo"))
		expect(Checker.resultPure(undefined)).toEqual(checker("a.foo", "b.foo"))
	})

	await it("Blacklist extension", () => {
		const checker = Checker.AsksWhen((x, y) => x.endsWith(".ts") && y.endsWith(".ts"), Checker.Error("Deny"))
		expect(Checker.resultError("Deny")).toEqual(checker("a.ts", "b.ts"))
		expect(Checker.resultPure(undefined)).toEqual(checker("a.foo", "b.ts"))
		expect(Checker.resultPure(undefined)).toEqual(checker("a.ts", "b.foo"))
		expect(Checker.resultPure(undefined)).toEqual(checker("a.foo", "b.foo"))
	})

	await it("Filter Extension", () => {
		const checker = Checker.IfM(
			Checker.Asks((x, y) => x.endsWith(".ts") && y.endsWith(".ts")),
			Checker.Allow(),
			Checker.Error("Deny"),
		)
		expect(Checker.resultAllow()).toEqual(checker("a.ts", "b.ts"))
		expect(Checker.resultError("Deny")).toEqual(checker("a.ts", "b.zz"))
		expect(Checker.resultError("Deny")).toEqual(checker("a.zz", "b.ts"))
		expect(Checker.resultError("Deny")).toEqual(checker("a.zz", "b.zz"))
	})

	await it("Alternative Filter", () => {
		const checker = Pipe(
			Checker.AsksWhen((x, y) => x.endsWith(".ts") && y.endsWith(".ts"), Checker.Allow()),
			Checker.Then(Checker.AsksWhen((x, y) => x.endsWith(".moo"), Checker.Allow())),
			Checker.Then(Checker.Error("Deny")),
		)
		expect(Checker.resultAllow()).toEqual(checker("a.ts", "b.ts"))
		expect(Checker.resultError("Deny")).toEqual(checker("a.ts", "b.zz"))
		expect(Checker.resultError("Deny")).toEqual(checker("a.zz", "b.ts"))
		expect(Checker.resultError("Deny")).toEqual(checker("a.zz", "b.zz"))

		expect(Checker.resultAllow()).toEqual(checker("a.moo", "b.ts"))
		expect(Checker.resultAllow()).toEqual(checker("a.moo", "b.moo"))
		expect(Checker.resultError("Deny")).toEqual(checker("a.ts", "b.moo"))
	})
})
