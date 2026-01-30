import { Option, Reader } from "../../Lib/pure.ts"

export type Classifier<A> = Reader<string, Option<A>>

// Might need to delete this due to union type complexity
export type GlobExtension<T extends string> =
	| T
	| `${T}.${T}`
