import { CurryRev } from "../../Lib/pure.ts"

export type Reader<Env, A> = (env: Env) => A

export const Pure = <Env=void, A=unknown>(a: A): Reader<Env, A> =>
	(_env: Env) => a

export const Map_ = <Env, A, B>(m: Reader<Env, A>, f: (a: A) => B): Reader<Env, B> =>
	(env: Env) => f(m(env))
export const Map: {
	<Env, A, B>(m: Reader<Env, A>, f: (a: A) => B): Reader<Env, B>
	<Env, A, B>(f: (a: A) => B): ((m: Reader<Env, A>) => Reader<Env, B>)
} = CurryRev(Map_)

export const Bind_ = <Env, A, B>(m: Reader<Env, A>, f: (a: A) => Reader<Env, B>): Reader<Env, B> =>
	(env: Env) => f(m(env))(env)
export const Bind: {
	<Env, A, B>(m: Reader<Env, A>, f: (a: A) => Reader<Env, B>): Reader<Env, B>
	<Env, A, B>(f: (a: A) => Reader<Env, B>): ((m: Reader<Env, A>) => Reader<Env, B>)
} = CurryRev(Bind_)

/** Fusion of Ask (Id) and Map. */
export const Asks = <Env, A>(f: (env: Env) => A): Reader<Env, A> =>
	(env: Env) => f(env)
