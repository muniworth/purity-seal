import { describe, it } from "node:test"
import { expect } from "expect"

import * as PS from "../nodejs.ts"

await describe("Classifier Monad", async () => {
	const run = (path: string) => <A, B>(a: PS.Classify<A>, b: PS.Option<B>) =>
		expect(a(path)).toEqual(b)
	const equal = (path: string) => <A, B>(a: PS.Classify<A>, b: PS.Classify<B>) =>
		expect(a(path)).toEqual(b(path))

	await it("Composes Reader and Option", () => {
		run("filepath")(
			PS.Classify.Pure("http"),
			PS.Option.Some("http"),
		)

		run("filename")(
			PS.Pipe(PS.Classify.Pure("pure"), PS.Classify.Map(x => x)),
			PS.Option.Some("pure"),
		)
		run("filename")(
			PS.Pipe(PS.Classify.Pure("pure"), PS.Classify.Map(_ => "http")),
			PS.Option.Some("http"),
		)

		equal("filename")(
			PS.Pipe(PS.Classify.Pure("pure"), PS.Classify.Map(x => x)),
			PS.Pipe(PS.Classify.Pure("pure"), PS.Classify.BindOption(PS.Option.Some)),
		)
	})

	await it("Reclassify", () => {
		run("node_modules/Lib/fetch.ts")(
			PS.Classify.AsksWhen(
				filepath => filepath.endsWith("Lib/fetch.ts"),
				_filepath => PS.Option.Some("http"),
			),
			PS.Option.Some("http"),
		)
		run("node_modules/Lib/fetch.ts")(
			PS.Classify.SetWhen(
				filepath => filepath.endsWith("Lib/fetch.ts"),
				_filepath => "http",
			),
			PS.Option.Some("http"),
		)

		run("filename")(
			PS.Classify.AsksWhen(
				filepath => filepath.endsWith("Lib/fetch.ts"),
				_filepath => PS.Option.Some("http"),
			),
			PS.Option.None()
		)
		run("filename")(
			PS.Classify.SetWhen(
				filepath => filepath.endsWith("Lib/fetch.ts"),
				_filepath => "http",
			),
			PS.Option.None()
		)
	})
})
