import path from "node:path"
import { Array, Option, Pipe } from "../../Lib/pure.ts"
import type { Classifier } from "../Classifier/pure.ts"

const matchExtension =
	<T extends string>(glob: T) => {
		const exts = glob.split(".")

		return (filepath: string): boolean => {
			const filename = path.basename(filepath)
			const fileParts = filename.split(".")
			// glob ordering non-symmetric: a.b <> b.a
			return filename.includes(glob)
				// glob parts individually valid: a.bc <> a.b.c
				&& exts.every(ext => fileParts.includes(ext))
		}
	}

/** Create list of filename -> extension matchers. Order matters, so put globs first. */
export const FromExtensions = <A extends string>(exts: readonly A[]): Classifier<A> => {
	const rules = Array.Map(exts, a => ({ Class: a, Matcher: matchExtension(a) }))

	return filepath => Pipe(
		Array.Find_(rules, r => r.Matcher(filepath)),
		Option.Map(x => x.Class),
	)
}
