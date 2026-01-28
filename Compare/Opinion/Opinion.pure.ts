/** Pure is the monad success case for checker pipelines
  * to continue running, i.e. Pure = Undecided.
  *
  * All other states are failure cases,
  * i.e. they terminate checking with a decision.
*/
export type Opinion<A> =
	| { _tag: "Pure", Value: A }
	| { _tag: "Allow" }
	| { _tag: "Error", Reason: string }
	| { _tag: "Warn", Message: string }

export const Pure = <A>(a: A): Opinion<A> => ({ _tag: "Pure", Value: a })
export const Allow = (): Opinion<never> => ({ _tag: "Allow" })
export const Error = (x: string): Opinion<never> => ({ _tag: "Error", Reason: x })
export const Warn = (x: string): Opinion<never> => ({ _tag: "Warn", Message: x })

export const Map = <A, B>(m: Opinion<A>, f: (a: A) => B): Opinion<B> =>
	m._tag === "Pure" ? Pure(f(m.Value)) : m

export const Bind = <A, B>(m: Opinion<A>, f: (t: A) => Opinion<B>): Opinion<B> =>
	m._tag === "Pure" ? f(m.Value) : m
