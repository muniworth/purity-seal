export type PartialOrderKey = boolean | number | bigint | string | symbol

type strictRelation = "<" | ">"
export type Relation =
	| strictRelation
	| "=" // Derived from equality on T
	| "?" // Encoded as absence of a map entry

export type PartialOrder<T extends PartialOrderKey> = Map<T, Map<T, strictRelation>>

const invert = (rel: strictRelation) => (rel === "<" ? ">" : "<")

export const MakePartialOrder = <T extends PartialOrderKey>(ls: [T, T][]): PartialOrder<T> | null => {
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

	ls.forEach(([x, y]) => {
		addRelSym(x, "<", y)

		// Transitively-close y: for each w < x, symmetrically set w < y.
		getRels(x).forEach((rel, w) => {
			if (rel === ">") addRelSym(w, "<", y)
		})

		// Transitively-close x: for each z > y, symmetrically set x < z.
		getRels(y).forEach((rel, z) => {
			if (rel === "<") addRelSym(x, "<", z)
		})
	})

	return cyclic ? null : po
}

export const QueryPartialOrder = <T extends PartialOrderKey>(po: PartialOrder<T>, x: T, y: T): Relation =>
	x === y ? "=" : (po.get(x)?.get(y) ?? "?")
