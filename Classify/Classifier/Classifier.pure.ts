import { Option, Reader } from "../../Lib/pure.ts"

export type Classifier<A> = Reader<string, Option<A>>

export type GlobExtension<T extends string> =
	| T
	| `${T}.${T}`
	| `${T}.${T}.${T}`
	| `${T}.${T}.${T}.${T}`
	| `${T}.${T}.${T}.${T}.${T}`
