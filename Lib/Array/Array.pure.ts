import { CurryRev } from "../Function/pure.ts"
import { Option } from "../Option/pure.ts"

export type Array<A> = globalThis.ReadonlyArray<A>
export type ArrayMut<A> = globalThis.Array<A>// equivalent to A[]
export type NonEmpty<A> = readonly [A, ...A[]]
export type NonEmptyMut<A> = [A, ...A[]]

export type Infer<S extends Array<any>> =
	S extends Array<infer A> ? A : never

// -----------------------------------------------------------------------------
// Emptiness
// -----------------------------------------------------------------------------

export type AndEmpty1<
	Zs extends Array<unknown>,
	R,
> = Zs extends NonEmpty<unknown>
	? NonEmptyMut<R>
	: R[]

export type AndEmpty2<
	Ys extends  Array<unknown>,
	Zs extends Array<unknown>,
	R,
> = Zs extends NonEmptyMut<unknown>
	? (Ys extends NonEmptyMut<unknown>
		? NonEmptyMut<R>
		: R[]
	)
	: R[]

// -----------------------------------------------------------------------------
// Type Guards
// -----------------------------------------------------------------------------

export const IsNonEmpty: {
	<A>(xs: Array<A>): xs is NonEmpty<A>
	<A>(xs: A[]): xs is NonEmptyMut<A>
} = (<A>(xs: A[]) => xs.length > 0) as typeof IsNonEmpty

// -----------------------------------------------------------------------------
// Transforms
// -----------------------------------------------------------------------------

export const Bind_ = <A extends Array<any>, B>(f: (a: Infer<A>, i: number) => B[]) => (xs: A): B[] =>
	xs.flatMap(f)
export const Bind: {
	<A extends Array<any>, B>(xs: A, f: (a: Infer<A>, i: number) => NonEmptyMut<B>): AndEmpty1<A, B>
	<A extends Array<any>, B>(xs: A, f: (a: Infer<A>, i: number) => B[]): B[]
	<A extends Array<any>, B>(f: (a: Infer<A>, i: number) => NonEmptyMut<B>): (xs: A) => AndEmpty1<A, B>
	<A extends Array<any>, B>(f: (a: Infer<A>, i: number) => B[]): (xs: A) => B[]
} = CurryRev(Bind_)

export const Choose_ = <A, B>(xs: Array<A>, chooser: (x: A, i: number) => Option<B>): B[] => {
	const out: B[] = []
	for (let i=0; i < xs.length; i++) {
		const y = chooser(xs[i]!, i)
		if (Option.IsSome(y)) out.push(y.value)
	}
	return out
}
export const Choose: {
	<A, B>(xs: Array<A>, chooser: (x: A, i: number) => Option<B>): B[]
	<A, B>(chooser: (x: A, i: number) => Option<B>): (xs: Array<A>) => B[]
} = CurryRev(Choose_)

export const Filter_ = <A>(xs:  Array<A>, pred: (a: A, i: number) => boolean): A[] => {
	const out: A[] = []
	for (let i=0; i < xs.length; i++) {
		const x = xs[i]!
		if (pred(x, i)) out.push(x)
	}
	return out
}
export const Filter: {
	<A, B extends A>(xs: Array<A>, refine: (a: A, i: number) => a is B): B[]
	<A, B extends A>(refine: (a: A, i: number) => a is B): (xs:  Array<A>) => B[]
	<A>(xs:  Array<A>, pred: (a: A, i: number) => boolean): A[]
	<A>(pred: (a: NoInfer<A>, i: number) => boolean): (xs:  Array<A>) => A[]
} = CurryRev(Filter_)

export const Map_ = <A extends Array<any>, B>(xs: A, f: (a: Infer<A>, i: number) => B): AndEmpty1<A, B> =>
	xs.map(f) as AndEmpty1<A, B>
export const Map: {
  <A extends Array<any>, B>(f: (a: Infer<A>, i: number) => B): (xs: A) => AndEmpty1<A, B>
  <A extends Array<any>, B>(xs: A, f: (a: Infer<A>, i: number) => B): AndEmpty1<A, B>
} = CurryRev(Map_)
