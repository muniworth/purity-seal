// Circular, but it's type-only so it's fine.
import type { Deps } from "../Checker.pure.ts"

/** Pure is the monad success case for checker pipelines
  * to continue running, i.e. Pure = Undecided.
  *
  * All other states are failure cases,
  * i.e. they terminate checking with a decision.
*/
export type Opinion<A> =
	| { _tag: "Pure", Value: A }
	| { _tag: "Allow" }
	| { _tag: "Deny", Deps: Deps}
	| { _tag: "Warn", Message: string }

export const Pure = <A>(a: A): Opinion<A> => ({ _tag: "Pure", Value: a })
export const Allow = (): Opinion<never> => ({ _tag: "Allow" })
export const Deny = (d: Deps): Opinion<never> => ({ _tag: "Deny", Deps: d })
export const Warn = (x: string): Opinion<never> => ({ _tag: "Warn", Message: x })

export const Map = <A, B>(m: Opinion<A>, f: (a: A) => B): Opinion<B> =>
	m._tag === "Pure" ? Pure(f(m.Value)) : m

export const Bind = <A, B>(m: Opinion<A>, f: (t: A) => Opinion<B>): Opinion<B> =>
	m._tag === "Pure" ? f(m.Value) : m
