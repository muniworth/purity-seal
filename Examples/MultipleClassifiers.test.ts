import { describe, it } from "node:test"
import { expect } from "expect"

import * as PS from "../nodejs.ts"

await describe("Multiple Classifiers", async () => {
	const libHttp = PS.Classify.Classifier.SetWhen(
		filepath => filepath.endsWith("node_modules/FancyHTTP/index.ts"),
		_filepath => "http",
	)
	const libStats = PS.Classify.Classifier.SetWhen(
		filepath => filepath.endsWith("node_modules/Stats/math.ts"),
		_filepath => "pure",
	)
	const classify = PS.Pipe(
		PS.Classify.File.FromExtensions(["pure", "http"]),
		PS.Classify.Classifier.Catch(libHttp),
		PS.Classify.Classifier.Catch(libStats),
	)
	const po = PS.PartialOrder.Make([
		["http", "pure"],
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
	})
})
