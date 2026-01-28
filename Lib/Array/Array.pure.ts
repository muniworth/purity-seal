import { CurryRev } from "../Function/pure.ts"
import { Option } from "../Option/pure.ts"

export type Array<A> = globalThis.ReadonlyArray<A>
export type ArrayMut<A> = globalThis.Array<A>
export type NonEmptyMut<A> = [A, ...Array<A>]
export type NonEmpty<A> = readonly [A, ...Array<A>]

export type Infer<S extends Array<any>> =
	S extends Array<infer A> ? A : never

// -----------------------------------------------------------------------------
// Emptiness
// -----------------------------------------------------------------------------

export type AndEmpty1<
	Zs extends readonly unknown[],
	R,
> = Zs extends NonEmpty<unknown>
	? NonEmptyMut<R>
	: R[]

export type AndEmpty2<
	Ys extends readonly unknown[],
	Zs extends readonly unknown[],
	R,
> = Zs extends NonEmptyMut<unknown>
	? (Ys extends NonEmptyMut<unknown>
		? NonEmptyMut<R>
		: R[]
	)
	: R[]

// -----------------------------------------------------------------------------
// Transforms
// -----------------------------------------------------------------------------

export const Map_ = <A extends readonly any[], B>(xs: A, f: (a: Infer<A>, i: number) => B): AndEmpty1<A, B> =>
	xs.map(f) as AndEmpty1<A, B>
export const Map: {
  <A extends Array<any>, B>(f: (a: Infer<A>, i: number) => B): (xs: A) => AndEmpty1<A, B>
  <A extends Array<any>, B>(xs: A, f: (a: Infer<A>, i: number) => B): AndEmpty1<A, B>
} = CurryRev(Map_)

// -----------------------------------------------------------------------------
// Reductions
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Searching
// -----------------------------------------------------------------------------

export const Find_ = <A>(xs: readonly A[], pred: (x: A, i: number) => boolean): Option<A> =>
	Option.OfNullable(xs.find(pred))
export const Find: {
	<A, B extends A>(xs: readonly A[], pred: (x: A, i: number) => x is B): Option<B>
	<A, B extends A>(pred: (x: A, i: number) => x is B): (xs: readonly A[]) => Option<B>
	<A>(xs: readonly A[], pred: (x: A, i: number) => boolean): Option<A>
	<A>(pred: (x: A, i: number) => boolean): (xs: readonly A[]) => Option<A>
} = CurryRev(Find_)
