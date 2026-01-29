import path from "node:path"
import { Array, Option, Pipe } from "../../Lib/pure.ts"
import type { Classifier } from "../Classifier/pure.ts"

const matchExtension =
	<T extends string>(ext: T) => {
		if (ext.includes(".")) {
			console.error(`Purity Seal -- Classifiers never match on glob extensions, but "${ext}" contains '.'`)
			return (_: string) => false
		}
		else return (x: string): boolean => x === ext
	}

/** Create list of filename -> extension matchers. Order matters, so put globs first. */
export const FromExtensions = <A extends string>(exts: readonly A[]): Classifier<A> => {
	const rules = Array.Map(exts, a => ({ Class: a, Matcher: matchExtension(a) }))

	return filepath => Pipe(
		path.basename(filepath),
		x => x.split("."),
		parts => Array.Map_FindLast(
			parts,
			part => rules.find(r => r.Matcher(part))?.Class!,
			x => x !== undefined,
		),
		// x => x as any,
		// Array.Find_(rules, r => r.Matcher(filepath)),
		// Option.Map(x => x.Class),
	)
}
