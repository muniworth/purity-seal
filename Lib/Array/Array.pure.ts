import { CurryRev } from "../Function/pure.ts"

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

export const Filter_ = <A>(xs: readonly A[], pred: (a: A, i: number) => boolean): A[] => {
	const out: A[] = []
	for (let i=0; i < xs.length; i++) {
		const x = xs[i]!
		if (pred(x, i)) out.push(x)
	}
	return out
}
export const Filter: {
	<A, B extends A>(xs: readonly A[], refine: (a: A, i: number) => a is B): B[]
	<A, B extends A>(refine: (a: A, i: number) => a is B): (xs: readonly A[]) => B[]
	<A>(xs: readonly A[], pred: (a: A, i: number) => boolean): A[]
	<A>(pred: (a: NoInfer<A>, i: number) => boolean): (xs: readonly A[]) => A[]
} = CurryRev(Filter_)

export const Map_ = <A extends readonly any[], B>(xs: A, f: (a: Infer<A>, i: number) => B): AndEmpty1<A, B> =>
	xs.map(f) as AndEmpty1<A, B>
export const Map: {
  <A extends Array<any>, B>(f: (a: Infer<A>, i: number) => B): (xs: A) => AndEmpty1<A, B>
  <A extends Array<any>, B>(xs: A, f: (a: Infer<A>, i: number) => B): AndEmpty1<A, B>
} = CurryRev(Map_)
