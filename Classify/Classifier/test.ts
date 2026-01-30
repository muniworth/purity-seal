import { describe, it } from "node:test"
import { expect } from "expect"

import { Option, Pipe } from "../../Lib/pure.ts"
import { Classify } from "../nodejs.ts"

await describe("Classify file by extensions", async () => {
	const run = (path: string) => <A, B>(a: Classify.Classifier<A>, b: Option<B>) =>
		expect(a(path)).toEqual(b)
	const equal = (path: string) => <A, B>(a: Classify.Classifier<A>, b: Classify.Classifier<B>) =>
		expect(a(path)).toEqual(b(path))

	await it("Composes Reader and Option", () => {
		// Pure
		run("filepath")(
			Classify.Classifier.Pure("http"),
			Option.Some("http"),
		)

		// Map
		run("filename")(
			Pipe(Classify.Classifier.Pure("pure"), Classify.Classifier.Map(x => x)),
			Option.Some("pure"),
		)
		run("filename")(
			Pipe(Classify.Classifier.Pure("pure"), Classify.Classifier.Map(_ => "http")),
			Option.Some("http"),
		)

		// BindOption
		equal("filename")(
			Pipe(Classify.Classifier.Pure("pure"), Classify.Classifier.Map(x => x)),
			Pipe(Classify.Classifier.Pure("pure"), Classify.Classifier.BindOption(Option.Some)),
		)
	})

	await it("Reclassify", () => {
		run("node_modules/Lib/fetch.ts")(
			Classify.Classifier.AsksWhen(
				filepath => filepath.endsWith("Lib/fetch.ts"),
				_filepath => Option.Some("http"),
			),
			Option.Some("http"),
		)
		run("node_modules/Lib/fetch.ts")(
			Classify.Classifier.SetWhen(
				filepath => filepath.endsWith("Lib/fetch.ts"),
				_filepath => "http",
			),
			Option.Some("http"),
		)

		run("filename")(
			Classify.Classifier.AsksWhen(
				filepath => filepath.endsWith("Lib/fetch.ts"),
				_filepath => Option.Some("http"),
			),
			Option.None()
		)
		run("filename")(
			Classify.Classifier.SetWhen(
				filepath => filepath.endsWith("Lib/fetch.ts"),
				_filepath => "http",
			),
			Option.None()
		)
	})
})
