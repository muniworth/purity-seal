import type { Key, PartialOrder as m } from "./PartialOrder.pure.ts"
export * as PartialOrder from "./PartialOrder.pure.ts"
export type PartialOrder<A extends Key> = m<A>
