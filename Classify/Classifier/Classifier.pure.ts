import { CurryRev, Flow, Option, Reader } from "../../Lib/pure.ts"

type ext = string// semantic alias for file extension

// Might need to delete this due to union type complexity
export type GlobExtension<T extends string> =
	| T
	| `${T}.${T}`

export type Classifier<A> = Reader<ext, Option<A>>

export const Pure = <A>(a: A): Classifier<A> => _ => Option.Some(a)
export const None = <A=never>(): Classifier<A> => _ => Option.None()

export const Map_ = <A, B>(m: Classifier<A>, f: (a: A) => B) =>
	Reader.Map_(m, m => Option.Map_(m, f))
export const Map: {
	<A, B>(m: Classifier<A>, f: (a: A) => B): Classifier<B>
	<A, B>(f: (a: A) => B): ((m: Classifier<A>) => Classifier<B>)
} =  CurryRev(Map_)

export const BindOption_ = <A, B>(m: Classifier<A>, f: (a: A) => Option<B>): Classifier<B> =>
	Reader.Map_(m, m => Option.Bind_(m, f))
export const BindOption: {
	<A, B>(m: Classifier<A>, f: (a: A) => Option<B>): Classifier<B>
	<A, B>(f: (a: A) => Option<B>): ((m: Classifier<A>) => Classifier<B>)
} = CurryRev(BindOption_)

/** Fusion of Ask (Id) and Map. */
export const Asks = <A>(f: (ext: ext) => A) =>
	(ext: ext) => Option.Some(f(ext))

// -----------------------------------------------------------------------------
// Custom abstractions
// -----------------------------------------------------------------------------

export const AsksWhen_ = <A>(p: (ext: ext) => boolean, m: Classifier<A>): Classifier<A> =>
	Reader.Bind_(Reader.Asks(p), b => b ? m : None())

/** Use a classifier if the filepath satisfies a predicate. */
export const AsksWhen: {
	<A>(p: (ext: ext) => boolean, m: Classifier<A>): Classifier<A>
	<A>(m: Classifier<A>): (p: (ext: ext) => boolean) => Classifier<A>
} = CurryRev(AsksWhen_)

export const SetWhen_ = <A>(p: (ext: ext) => boolean, f: (ext: ext) => A): Classifier<A> =>
	AsksWhen_(p, Flow(f, Option.Some))
/** Set the file classification if the filepath satisfies a predicate. */
export const SetWhen: {
	<A>(p: (ext: ext) => boolean, f: (ext: ext) => A): Classifier<A>
	<A>(f: (ext: ext) => A): (p: (ext: ext) => boolean) => Classifier<A>
} = CurryRev(SetWhen_)
