import { CurryRev, Pipe } from "../Function/pure.ts"

export type Some<A> = { readonly _tag: "Some"; readonly value: A }
export type None<A = never> = { readonly _tag: "None" }
export type Option<A> = Some<A> | None<A>

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

/** Lifts a value to an Option. */
export const Some = <A>(value: A): Option<A> => ({
	_tag: "Some",
	value: value,
})

const none: Option<never> = ({ _tag: "None" })
/** Returns 'None' for a given type. */
export const None = <A = never>(): Option<A> => none

/** Converts a nullable value into an Option */
export const OfNullable = <A>(value: A | null | undefined): Option<NonNullable<A>> =>
	(value === null || value === undefined) ? none : Some(value)

export const Some_Filter_ = <A>(a: A, pred: (a: A) => boolean): Option<A> =>
	pred(a) ? Some(a) : None()
export const Some_Filter: {
	<A>(a: A, pred: (a: A) => boolean): Option<A>
	<A>(pred: (a: A) => boolean): (a: A) => Option<A>
} = CurryRev(Some_Filter_)

// -----------------------------------------------------------------------------
// Predicates
// -----------------------------------------------------------------------------

/** Returns `true` if it is a `Some` */
export const IsSome = <A>(opt: Option<A>): opt is Some<A> =>
	opt._tag === "Some"

/** Returns `true` if it is a `None` */
export const IsNone = <A>(opt: Option<A>): opt is None<A> =>
	opt._tag === "None"


// -----------------------------------------------------------------------------
// Transforms
// -----------------------------------------------------------------------------

/** Combines all Options in a tuple if they are `Some`
 *
 * @example All([Some(1), Some("a")]) = Some([1, "a"])
 *
 * @example All([Some(1), None(), None()]) = None() */
export const All = <const Os extends readonly Option<unknown>[]>(
	os: readonly Option<unknown>[] & Os, // Hack for TypeScript inference
): Option<{ [K in keyof Os]: Os[K] extends Option<infer A> ? A : never }> => {
	const out: unknown[] = []
	for (const o of os) {
		if (IsNone(o)) return None()
		out.push(o.value)
	}
	return Some(out as { [K in keyof Os]: Os[K] extends Option<infer A> ? A : never })
}

export const Map_ = <A, B>(opt: Option<A>, f: (a: A) => B): Option<B> =>
	IsSome(opt) ? Some(f(opt.value)) : none
/** Applies some function to modify the `Some` case */
export const Map: {
	<A, B>(opt: Option<A>, f: (a: A) => B): Option<B>
	<A, B>(f: (a: A) => B): (opt: Option<A>) => Option<B>
} = CurryRev(Map_)

// -----------------------------------------------------------------------------
// Eliminators
// -----------------------------------------------------------------------------

/** Gets the value of a `Some`, or returns some fallback value */
export const Default_ = <A, B=A>(opt: Option<A>, fallback: B): A | B =>
	IsSome(opt) ? opt.value : fallback
/** Gets the value of a `Some`, or returns some fallback value */
export const Default: {
	<A, B=A>(opt: Option<A>, fallback: B): A | B
	<B>(fallback: B): <A=B>(opt: Option<A>) => A | B
} = CurryRev(Default_)

/** Gets the value of a `Some`, or returns some fallback function */
export const DefaultLazy_ = <A, B=A>(opt: Option<A>, fallback: () => B): A | B =>
	IsSome(opt) ? opt.value : fallback()
/** Gets the value of a `Some`, or returns some fallback function */
export const DefaultLazy: {
	<A, B=A>(opt: Option<A>, fallback: () => B): A | B
	<B>(fallback: () => B): <A=B>(opt: Option<A>) => A | B
} = CurryRev(DefaultLazy_)

export const Elim_ = <A, B, C>(opt: Option<A>, fallback: B, f: (x: A) => C): B | C =>
	Pipe(Map_(opt, f), o => Default_(o, fallback))
/** Applies a function to an option and then returns either the value or a fallback */
export const Elim: {
	<A, B, C>(opt: Option<A>, fallback: B, f: (x: A) => C): B | C
	<A, B, C>(fallback: B, f: (x: A) => C): (opt: Option<A>) => B | C
} = CurryRev(Elim_)

export const ElimLazy_ = <A, B, C>(opt: Option<A>, fallback: () => B, f: (x: A) => C): B | C =>
	Pipe(Map(opt, f), DefaultLazy(fallback))
/** Applies a function to an option and then returns either the value or a lazy fallback */
export const ElimLazy: {
	<A, B, C>(opt: Option<A>, fallback: () => B, f: (x: A) => C): B | C
	<A, B, C>(fallback: () => B, f: (x: A) => C): (opt: Option<A>) => B | C
} = CurryRev(ElimLazy_)

export const Match_ = <A, M1, M2>(opt: Option<A>, handlers: { onSome: (value: A) => M1; onNone: () => M2 }): M1 | M2 =>
	IsSome(opt)
		? handlers.onSome(opt.value)
		: handlers.onNone()
/** Performs different actions dependant on the Option being `Some` or `None` */
export const Match: {
	<A, M>(opt: Option<A>, handlers: { onSome: (value: A) => M; onNone: () => M }): M
	<A, M1, M2>(opt: Option<A>, handlers: { onSome: (value: A) => M1; onNone: () => M2 }): M1 | M2
	<A, M1, M2>(handlers: { onSome: (value: A) => M1; onNone: () => M2 }): (opt: Option<A>) => M1 | M2
} = CurryRev(Match_)
