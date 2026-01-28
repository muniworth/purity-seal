import { Option, Reader } from "../../Lib/pure.ts"

export type Classifier<A> = Reader<string, Option<A>>
