import { describe, it } from "node:test"
import { expect } from "expect"

import * as PS from "../nodejs.ts"

await describe("Multiple Classifiers", async () => {
	const libStats = PS.Classify.SetWhen(
		filepath => filepath.startsWith("node_modules/Stats"),
		_filepath => "pure",
	)
	const libHttp = PS.Classify.SetWhen(
		filepath => filepath === "node_modules/FancyHTTP/index.ts",
		_filepath => "http",
	)
	const libGlob = PS.Classify.SetWhen(
		filepath => filepath.startsWith("node_modules/framework"),
		filepath => filepath.includes("cache") ? "http" : "dom.http",
	)
	const classify = PS.Pipe(
		PS.Classify.Extensions(["pure", "http", "dom"]),
		PS.Classify.Catch(libStats),
		PS.Classify.Catch(libHttp),
		PS.Classify.Catch(libGlob),
	)
	const po = PS.PartialOrder.Make([
		["dom.http", ["dom", "http"], "pure"],
	])
	const check = PS.Pipe(
		PS.Checker.Build(classify)(po),
		PS.Result.GetOrThrow,
	)

	await it("Classifies external code", () => {
		expect(check(["http.ts", "node_modules/FancyHTTP/index.ts"])).toEqual(PS.Checker.Opinion.Allow())
		expect(check(["pure.ts", "node_modules/FancyHTTP/index.ts"])).toEqual(PS.Checker.Opinion.Deny(["pure.ts", "node_modules/FancyHTTP/index.ts"]))

		expect(check(["http.ts", "node_modules/Stats/math.ts"])).toEqual(PS.Checker.Opinion.Allow())
		expect(check(["pure.ts", "node_modules/Stats/math.ts"])).toEqual(PS.Checker.Opinion.Allow())

		expect(check(["http.ts", "node_modules/framework/cache.index"])).toEqual(PS.Checker.Opinion.Allow())
		expect(check(["dom.http.ts", "node_modules/framework/cache.index"])).toEqual(PS.Checker.Opinion.Allow())
		expect(check(["http.dom.ts", "node_modules/framework/cache.index"])).toEqual(PS.Checker.Opinion.Deny(["http.dom.ts", "node_modules/framework/cache.index"]))

		expect(check(["dom.http.ts", "node_modules/framework/ui.index"])).toEqual(PS.Checker.Opinion.Allow())
		expect(check(["dom.ts", "node_modules/framework/ui.index"])).toEqual(PS.Checker.Opinion.Deny(["dom.ts", "node_modules/framework/ui.index"]))
		expect(check(["http.ts", "node_modules/framework/ui.index"])).toEqual(PS.Checker.Opinion.Deny(["http.ts", "node_modules/framework/ui.index"]))
	})
})
