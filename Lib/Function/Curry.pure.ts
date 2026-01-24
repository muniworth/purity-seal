/**
* Transforms a function parameterization into two call modes:
* 1. Unchanged.
* 2. Partial application, with parameters rotated at the pivot point.
*
* Requires explicit type overloads to reflect runtime behavior. Inspired by 'dual' in Effect-TS.
*/
export const CurryRev = <
	Original extends (...args: Array<any>) => any,
	Curried extends (...args: Array<any>) => any,
>(body: Original): Curried =>
	// @ts-expect-error
	(...args1: any) => {
		if (args1.length >= body.length)
			return body(...args1)
		else
			// TODO performance -- we probably don't need to mem-copy here
			return (...args2: any) => body(...args2.slice(0, Math.max(0, body.length - args1.length)), ...args1)
	}
