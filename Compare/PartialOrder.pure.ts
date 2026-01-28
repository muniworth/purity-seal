import { Result } from "../Lib/pure.ts"

export type PartialOrderKey = boolean | number | bigint | string | symbol

type strictRelation = "<" | ">"
export type Relation =
	| strictRelation
	| "=" // Derived from equality on T
	| "?" // Encoded as absence of a map entry

export type PartialOrder<T extends PartialOrderKey> = Map<T, Map<T, strictRelation>>

// type twoOrMore<T> = [T, T, ...T[]]
export type Level<T> = T | T[]
export type Chain<T> = Level<T>[]

const invert = (rel: strictRelation) => (rel === "<" ? ">" : "<")

export const MakePartialOrder = <T extends PartialOrderKey>(chains: Chain<T>[]): Result<PartialOrder<T>, string> => {
	const po = new Map<T, Map<T, strictRelation>>()
	let cyclic = false

	const getRels = (x: T) => {
		if (!po.has(x)) po.set(x, new Map<T, strictRelation>())
		return po.get(x)!
	}

	const addRel = (x: T, rel: strictRelation, y: T) => {
		const xRels = getRels(x)
		if (xRels.get(y) === invert(rel)) {
			cyclic = true
		} else {
			xRels.set(y, rel)
		}
	}

	const addRelSym = (x: T, _rel: "<", y: T) => {
		addRel(x, "<", y)
		addRel(y, ">", x)
	}

	for (const chain of chains) {
		if (chain.length === 0) continue
		// Iterate over adjacent pairs of levels.
		const head = chain[0]!
		const tail = chain.slice(1)
		let xs = Array.isArray(head) ? head : [head]
		for (const l of tail) {
			const ys = Array.isArray(l) ? l : [l]
			for (const x of xs) {
				for (const y of ys) {
					addRelSym(x, "<", y)

					// Transitively-close y: for each w < x, symmetrically set w < y.
					getRels(x).forEach((rel, w) => {
						if (rel === ">") addRelSym(w, "<", y)
					})

					// Transitively-close x: for each z > y, symmetrically set x < z.
					getRels(y).forEach((rel, z) => {
						if (rel === "<") addRelSym(x, "<", z)
					})
				}
			}
			xs = ys
		}
	}

	return cyclic
		? Result.Error("ClassifyAndCompare: orderRules induce a cycle")
		: Result.Ok(po)
}

export const QueryPartialOrder = <T extends PartialOrderKey>(po: PartialOrder<T>, x: T, y: T): Relation =>
	x === y ? "=" : (po.get(x)?.get(y) ?? "?")
