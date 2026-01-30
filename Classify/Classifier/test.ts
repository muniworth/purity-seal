import { describe, it } from "node:test"
import { expect } from "expect"

import * as PS from "../../nodejs.ts"

await describe("Classifier Monad", async () => {
	const run = (path: string) => <A, B>(a: PS.Classify.Classifier<A>, b: PS.Option<B>) =>
		expect(a(path)).toEqual(b)
	const equal = (path: string) => <A, B>(a: PS.Classify.Classifier<A>, b: PS.Classify.Classifier<B>) =>
		expect(a(path)).toEqual(b(path))

	await it("Composes Reader and Option", () => {
		run("filepath")(
			PS.Classify.Classifier.Pure("http"),
			PS.Option.Some("http"),
		)

		run("filename")(
			PS.Pipe(PS.Classify.Classifier.Pure("pure"), PS.Classify.Classifier.Map(x => x)),
			PS.Option.Some("pure"),
		)
		run("filename")(
			PS.Pipe(PS.Classify.Classifier.Pure("pure"), PS.Classify.Classifier.Map(_ => "http")),
			PS.Option.Some("http"),
		)

		equal("filename")(
			PS.Pipe(PS.Classify.Classifier.Pure("pure"), PS.Classify.Classifier.Map(x => x)),
			PS.Pipe(PS.Classify.Classifier.Pure("pure"), PS.Classify.Classifier.BindOption(PS.Option.Some)),
		)
	})

	await it("Reclassify", () => {
		run("node_modules/Lib/fetch.ts")(
			PS.Classify.Classifier.AsksWhen(
				filepath => filepath.endsWith("Lib/fetch.ts"),
				_filepath => PS.Option.Some("http"),
			),
			PS.Option.Some("http"),
		)
		run("node_modules/Lib/fetch.ts")(
			PS.Classify.Classifier.SetWhen(
				filepath => filepath.endsWith("Lib/fetch.ts"),
				_filepath => "http",
			),
			PS.Option.Some("http"),
		)

		run("filename")(
			PS.Classify.Classifier.AsksWhen(
				filepath => filepath.endsWith("Lib/fetch.ts"),
				_filepath => PS.Option.Some("http"),
			),
			PS.Option.None()
		)
		run("filename")(
			PS.Classify.Classifier.SetWhen(
				filepath => filepath.endsWith("Lib/fetch.ts"),
				_filepath => "http",
			),
			PS.Option.None()
		)
	})
})
