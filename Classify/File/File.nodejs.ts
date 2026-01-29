import path from "node:path"
import { Array, Option, Pipe, Set } from "../../Lib/pure.ts"
import type { Classifier } from "../Classifier/pure.ts"

/** Create list of filename -> extension matchers. Order does not matter. */
export const FromExtensions = <A extends string>(extIter: Iterable<A>): Classifier<Classifier.GlobExtension<A>> => {
	const exts: ReadonlySet<A> = Set.FromIterable(extIter)
	if (exts.values().some(x => x.includes("."))) {
		throw new Error(`File extension classifiers may not contain a '.' character. Pass multiple extensions instead.`)
	}

	return filepath => Pipe(
		path.basename(filepath).split("."),
		Array.Filter((x): x is A => Set.Has(exts, x)),
		x => x.join(".") as Classifier.GlobExtension<A>,
		Option.Some_Filter(x => x.length > 0),
	)
}
