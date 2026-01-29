import { describe, it } from "node:test"
import { expect } from "expect"

import * as PS from "../nodejs.ts"

await describe("Isolate Runtimes: dom, worker, test", async () => {
	const classify = PS.Classify.File.FromExtensions([
		"pure", "http", "dom", "worker", "test", "browser", "thread",
	])
	const po = PS.Compare.PartialOrder.Make([
		["browser", ["http", "dom"], "pure"],
		["thread", ["http", "worker"], "pure"],
		["test", "pure"],
	])
	const check = PS.Pipe(
		PS.Compare.ClassifyAndCompare(classify, po),
		PS.Result.GetOrThrow,
	)

	await it("Allow same runtime", () => {
		expect(check(["Fetch.http.ts", "pure.ts"])).toEqual(PS.Compare.Opinion.Allow())
		expect(check(["dom.ts", "pure.ts"])).toEqual(PS.Compare.Opinion.Allow())
		expect(check(["worker.ts", "pure.ts"])).toEqual(PS.Compare.Opinion.Allow())
		expect(check(["Assert.test.ts", "pure.ts"])).toEqual(PS.Compare.Opinion.Allow())
		expect(check(["browser.ts", "dom.ts"])).toEqual(PS.Compare.Opinion.Allow())
		expect(check(["browser.ts", "Fetch.http.ts"])).toEqual(PS.Compare.Opinion.Allow())
		expect(check(["thread.ts", "Fetch.http.ts"])).toEqual(PS.Compare.Opinion.Allow())
		expect(check(["thread.ts", "worker.ts"])).toEqual(PS.Compare.Opinion.Allow())
		expect(check(["test.ts", "pure.ts"])).toEqual(PS.Compare.Opinion.Allow())
		expect(check(["test.ts", "Assert.test.ts"])).toEqual(PS.Compare.Opinion.Allow())
	})

	await it("Deny mixed runtime", () => {
		expect(check(["pure.ts", "Fetch.http.ts"])).toEqual(PS.Compare.Opinion.Deny(["pure.ts", "Fetch.http.ts"]))
		expect(check(["pure.ts", "dom.ts"])).toEqual(PS.Compare.Opinion.Deny(["pure.ts", "dom.ts"]))
		expect(check(["pure.ts", "worker.ts"])).toEqual(PS.Compare.Opinion.Deny(["pure.ts", "worker.ts"]))
		expect(check(["pure.ts", "Assert.test.ts"])).toEqual(PS.Compare.Opinion.Deny(["pure.ts", "Assert.test.ts"]))
		expect(check(["dom.ts", "browser.ts"])).toEqual(PS.Compare.Opinion.Deny(["dom.ts", "browser.ts"]))
		expect(check(["Fetch.http.ts", "browser.ts"])).toEqual(PS.Compare.Opinion.Deny(["Fetch.http.ts", "browser.ts"]))
		expect(check(["Fetch.http.ts", "thread.ts"])).toEqual(PS.Compare.Opinion.Deny(["Fetch.http.ts", "thread.ts"]))
		expect(check(["worker.ts", "thread.ts"])).toEqual(PS.Compare.Opinion.Deny(["worker.ts", "thread.ts"]))
		expect(check(["pure.ts", "test.ts"])).toEqual(PS.Compare.Opinion.Deny(["pure.ts", "test.ts"]))
	})
})
