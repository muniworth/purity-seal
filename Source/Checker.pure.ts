import { CurryRev, Flow } from "../Lib/pure.ts"

export type ResultPure<T> = { _tag: "Pure", Value: T }
export type ResultAllow = { _tag: "Allow" }
export type ResultError = { _tag: "Error", Message: string }
export type ResultWarn = { _tag: "Warning", Message: string }
export type Result<T> =
	| ResultPure<T>
	| ResultAllow
	| ResultError
	| ResultWarn

export const resultPure = <T>(t: T): Result<T> => ({ _tag: "Pure", Value: t })
export const resultAllow = <T = never>(): Result<T> => ({ _tag: "Allow" })
const resultWarn = <T = never>(msg: string): Result<T> => ({ _tag: "Warning", Message: msg })
export const resultError = <T = never>(msg: string): Result<T> => ({ _tag: "Error", Message: msg })

const chainErrors = (a: ResultError, b: ResultError) =>
	resultError(a.Message + "; " + b.Message)

const resultAlternateCat = <A>(a: Result<A>, b: Result<A>): Result<A> => {
	switch (a._tag) {
		case "Pure":
			return a
		case "Allow":
			return a
		case "Warning":
			return a
		case "Error":
			if (b._tag === "Error")
				return chainErrors(a, b)
			else
				return b
	}
}

export type Checker<T> = (dependent: string, dependency: string) => Result<T>

/** Create a checker that does not read from its reader context. */
const illiterate =
	<T>(r: Result<T>): Checker<T> =>
	(_x: string, _y: string) =>
		r

export const Pure = <T>(val: T) => illiterate(resultPure(val))
export const Allow = <T>() => illiterate<T>(resultAllow())
export const Warn = <T>(msg: string) => illiterate<T>(resultWarn(msg))
export const Error = <T>(msg: string) => illiterate<T>(resultError(msg))

const resultBind = <T, U>(f: (t: T) => Result<U>, r: Result<T>): Result<U> => {
	switch (r._tag) {
		case "Pure":
			return f(r.Value)
		case "Allow":
		case "Warning":
		case "Error":
			return r
	}
}
export const Bind: {
	<T, U>(c: Checker<T>, f: (t: T) => Checker<U>): Checker<U>
	<T, U>(f: (t: T) => Checker<U>): (c: Checker<T>) => Checker<U>
} = CurryRev(<T, U>(c: Checker<T>, f: (t: T) => Checker<U>) =>
	(x: string, y: string) =>
		resultBind(t => f(t)(x, y), c(x, y)),
)

export const Asks = <T>(f: (x: string, y: string) => T): Checker<T> => (x, y) => resultPure(f(x, y))
// export const Ask: Checker<[string, string]> = Asks((x, y) => [x, y])

export const Map_ = <T, U>(c: Checker<T>, f: (t: T) => U) =>
	Bind(c, Flow(f, Pure))
export const Map: {
	<T, U>(c: Checker<T>, f: (t: T) => U): Checker<U>
	<T, U>(f: (t: T) => U): (c: Checker<T>) => Checker<U>
} = CurryRev(Map_)

export const Then_ = <T, U>(c: Checker<T>, d: Checker<U>) =>
	Bind(c, _ => d)
export const Then: {
	<T, U>(c: Checker<T>, d: Checker<U>): Checker<U>
	<T, U>(d: Checker<U>): (c: Checker<T>) => Checker<U>
} = CurryRev(Then_)

export const When_ = (b: boolean, c: Checker<void>) =>
	b ? c : Pure(undefined)
export const When: {
	(b: boolean, c: Checker<void>): Checker<void>
	(c: Checker<void>): (b: boolean) => Checker<void>
} = CurryRev(When_)

export const AsksWhen: {
	(p: (x: string, y: string) => boolean, c: Checker<void>): Checker<void>
	(c: Checker<void>): (p: (x: string, y: string) => boolean) => Checker<void>
} = CurryRev((p: (x: string, y: string) => boolean, c: Checker<void>): Checker<void> =>
	Bind(Asks(p), When(c))
)

export const IfM: {
	<T>(c: Checker<boolean>, t: Checker<T>, f: Checker<T>): Checker<T>
	<T>(t: Checker<T>, f: Checker<T>): (c: Checker<boolean>) => Checker<T>
} = CurryRev(<T>(c: Checker<boolean>, t: Checker<T>, f: Checker<T>): Checker<T> =>
	Bind(c, c => c ? t : f)
)
