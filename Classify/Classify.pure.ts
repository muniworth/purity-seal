import { CurryRev, Flow, Option, Reader } from "../Lib/pure.ts"

type ext = string// semantic alias for file extension

// Might need to delete this due to union type complexity
export type GlobExtension<T extends string> =
	| T
	| `${T}.${T}`

export type Classify<A> = Reader<ext, Option<A>>

export const Pure = <A>(a: A): Classify<A> => _ => Option.Some(a)
export const None = <A=never>(): Classify<A> => _ => Option.None()

export const Map_ = <A, B>(m: Classify<A>, f: (a: A) => B) =>
	Reader.Map_(m, m => Option.Map_(m, f))
export const Map: {
	<A, B>(m: Classify<A>, f: (a: A) => B): Classify<B>
	<A, B>(f: (a: A) => B): ((m: Classify<A>) => Classify<B>)
} =  CurryRev(Map_)

export const Bind_ = <A, B>(m: Classify<A>, f: (t: A) => Classify<B>) =>
	(ext: ext) => Option.Bind(m(ext), t => f(t)(ext))
export const Bind: {
	<A, B>(m: Classify<A>, f: (t: A) => Classify<B>): Classify<B>
	<A, B>(f: (t: A) => Classify<B>): (m: Classify<A>) => Classify<B>
} = CurryRev(Bind_)

export const BindOption_ = <A, B>(m: Classify<A>, f: (a: A) => Option<B>): Classify<B> =>
	Reader.Map_(m, m => Option.Bind_(m, f))
export const BindOption: {
	<A, B>(m: Classify<A>, f: (a: A) => Option<B>): Classify<B>
	<A, B>(f: (a: A) => Option<B>): ((m: Classify<A>) => Classify<B>)
} = CurryRev(BindOption_)

/** Fusion of Ask (Id) and Map. */
export const Asks = <A>(f: (ext: ext) => A) =>
	(ext: ext) => Option.Some(f(ext))

export const Catch_ = <A, B>(m1: Classify<A>, m2: Classify<B>): Classify<A|B> =>
	(ext: ext) => Option.Catch_(m1(ext), () => m2(ext))
/** Recover if a classifier fails to match an extension. */
export const Catch: {
	<A, B>(m1: Classify<A>, m2: Classify<B>): Classify<A|B>
	<A, B>(m2: Classify<B>): (m1: Classify<A>) => Classify<A|B>
} = CurryRev(Catch_)

// -----------------------------------------------------------------------------
// Custom abstractions
// -----------------------------------------------------------------------------

export const AsksWhen_ = <A extends string>(p: (ext: ext) => boolean, m: Classify<A>): Classify<A> =>
	Reader.Bind_(Reader.Asks(p), b => b ? m : None())

/** Use a classifier if the filepath satisfies a predicate. */
export const AsksWhen: {
	<A extends string>(p: (ext: ext) => boolean, m: Classify<A>): Classify<A>
	<A extends string>(m: Classify<A>): (p: (ext: ext) => boolean) => Classify<A>
} = CurryRev(AsksWhen_)

export const SetWhen_ = <A extends string>(p: (ext: ext) => boolean, f: (ext: ext) => A): Classify<A> =>
	AsksWhen_(p, Flow(f, Option.Some))
/** Set the file classification if the filepath satisfies a predicate. */
export const SetWhen: {
	<A extends string>(p: (ext: ext) => boolean, f: (ext: ext) => A): Classify<A>
	<A extends string>(f: (ext: ext) => A): (p: (ext: ext) => boolean) => Classify<A>
} = CurryRev(SetWhen_)
