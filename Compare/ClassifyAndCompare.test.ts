import { describe, it } from "node:test"
import { expect } from "expect"
import { Checker, Opinion } from "../Compare/pure.ts"
import { ClassifyAndCompare } from "./pure.ts"

await describe("Checker", async () => {
	// await it("Empty", () => {
	// 	const checker: Checker<void> = ClassifyAndCompare(
	// 		[],
	// 		[],
	// 	)
	// 	const out = checker(["a.foo", "b.foo"])
	// 	expect(out).toEqual(Opinion.Pure(undefined))
	// })
})
