import { CurryRev, Flow, Pipe } from "../Lib/pure.ts"

export type Reader<Env, A> = (env: Env) => A

/** Lift a pure value A into Reader while ignoring the environment. */
export const Pure = <Env=void, A=unknown>(a: A): Reader<Env, A> =>
	(_env: Env) => a

export const Map_ = <Env, A, B>(self: Reader<Env, A>, f: (a: A) => B): Reader<Env, B> =>
	(env: Env) => f(self(env))
export const Map: {
	<Env, A, B>(self: Reader<Env, A>, f: (a: A) => B): Reader<Env, B>
	<Env, A, B>(f: (a: A) => B): ((self: Reader<Env, A>) => Reader<Env, B>)
} = CurryRev(Map_)

export const Bind_ = <Env, A, B>(self: Reader<Env, A>, f: (a: A) => Reader<Env, B>): Reader<Env, B> =>
	(env: Env) => f(self(env))(env)
export const Bind: {
	<Env, A, B>(self: Reader<Env, A>, f: (a: A) => Reader<Env, B>): Reader<Env, B>
	<Env, A, B>(f: (a: A) => Reader<Env, B>): ((self: Reader<Env, A>) => Reader<Env, B>)
} = CurryRev(Bind_)

/** Fusion of Ask (Id) and Map. */
export const Asks = <Env, B>(f: (env: Env) => B): Reader<Env, B> =>
	(env: Env) => f(env)
