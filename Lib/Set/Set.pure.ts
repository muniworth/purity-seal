import type { Comparable, WidenComparable } from "../Util.pure.d.ts"

export type Set<A> = globalThis.ReadonlySet<A>
export type SetMut<A> = globalThis.Set<A>

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

const _empty = new globalThis.Set<never>()
export const Empty = <T>(): ReadonlySet<T> => _empty
export const Empty_Mut = <T>(): SetMut<T> => new globalThis.Set()

export const Singleton = <T>(x: T): SetMut<T> => new globalThis.Set([x])
export const FromIterable = <T>(xs: Iterable<T>): SetMut<T> => new globalThis.Set(xs)
export const ToArray = <T>(set: ReadonlySet<T>): T[] => [...set]
export const ToMutable = <T>(set: ReadonlySet<T>): SetMut<T> => new globalThis.Set(set)

// -----------------------------------------------------------------------------
// Querying
// -----------------------------------------------------------------------------

/** @alias Contains, Includes, Member */
export const Has = <A extends Comparable>(xs: Set<A>, y: A | WidenComparable<A>): y is A =>
	xs.has(y as A)
