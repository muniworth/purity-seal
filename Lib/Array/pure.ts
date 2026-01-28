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

export const Map_ = <A extends readonly any[], B>(xs: A, f: (a: Infer<A>, i: number) => B): AndEmpty1<A, B> =>
	xs.map(f) as AndEmpty1<A, B>
export const Map: {
  <A extends Array<any>, B>(f: (a: Infer<A>, i: number) => B): (xs: A) => AndEmpty1<A, B>
  <A extends Array<any>, B>(xs: A, f: (a: Infer<A>, i: number) => B): AndEmpty1<A, B>
} = CurryRev(Map_)
