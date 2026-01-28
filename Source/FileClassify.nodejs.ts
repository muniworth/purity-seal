import path from "node:path"
import { Array, Pipe } from "../Lib/pure.ts"
import type { Classifier } from "./ClassifyAndCompare.pure.ts"

const matchExtension = (ext: string, filename: string): boolean =>
	filename.split(".").includes(ext)

export const MatchExtension =
	<T extends string>(glob: T) => {
		const exts = glob.split(".")

		return (filepath: string): boolean => {
			const filename = path.basename(filepath)
			// glob ordering non-symmetric, ex. a.b <> b.a
			return filename.includes(exts.join("."))
				// glob parts individually valid, ex. hellofoo.moo <> hello.foo.moo
				&& exts.every(ext => matchExtension(ext, filename))
		}
	}

type rule<T> = {
	Class: T
	Matcher: (path: string) => boolean
}
const makeClassifier =
	<T>(rules: rule<T>[]): Classifier<T> =>
	s => rules.find(r => r.Matcher(s))?.Class ?? null

const classifyExtension = <T extends string>(ext: T): rule<T> => ({
	Class: ext,
	Matcher: MatchExtension(ext),
})

// TODO finish this and shift unit tests over to it.
const foo = Pipe(
	["pure", "dom", "dom.http", "http"] as const,
	Array.Map(classifyExtension),
	makeClassifier,
)
