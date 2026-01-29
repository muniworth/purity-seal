export type Comparable = bigint | boolean | number | string | symbol
export type Literal = bigint | boolean | number | null | string
export type Orderable = bigint | boolean | number | string

/** Un-narrows a union to its primitive type. */
export type WidenComparable<A extends Comparable> =
	A extends bigint ? bigint
	: A extends boolean ? boolean
	: A extends number ? number
	: A extends string ? string
	: A extends symbol ? symbol
	: never
