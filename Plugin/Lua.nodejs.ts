// @ts-expect-error
import * as Parser from "luaparse"
import Fs from "node:fs/promises"
import { Array, Option, Pipe } from "../Lib/pure.ts"
import type { Checker } from "../Checker/pure.ts"

type _assignment = { init: node[]; variables: var_identifier[] }
type assignment_global = { type: "AssignmentStatement" } & _assignment
type assignment_local = { type: "LocalStatement" } & _assignment
type function_call_expression ={ type: "CallExpression"; base: var_identifier; arguments: node[] }
type function_call_string = { type: "StringCallExpression"; base: node; argument: literal_string }
type literal_string = { type: "StringLiteral"; value: any; raw: string }
type var_identifier = { type: "Identifier"; name: string }

type node =
	| assignment_global
	| assignment_local
	| function_call_expression
	| function_call_string
	| literal_string
	| var_identifier
	| { type: "__unhandled" }// + many other node types

export type Options = {
	readonly luaVersion: "5.1" | "5.2" | "5.3" | "LuaJIT"
	/** Maps module name to filepath. */
	readonly resolveModule: (raw: string) => string,
}
export const BuildDeps = async (filenames: string[], bag: Options): Promise<Checker.Deps[]> => {
	// File imports may be circular.
	const opened: Set<string> = new Set()

	const rec = async (filename: string): Promise<Checker.Deps[]> => {
		if (opened.has(filename)) return []
		else {
			opened.add(filename)
			const filepath = bag.resolveModule(filename)
			const contents = await readFileContents(filepath)
			const imports = parseImports(contents, bag)
			const deps = imports.map((x): Checker.Deps => [
				filepath,
				bag.resolveModule(x),
			])
			const depsRec = await Promise.all(imports.map(rec))
			return deps.concat(depsRec.flat())
		}
	}

	const deps: Checker.Deps[] = []
	for (const filename of filenames) {
		deps.push(...await rec(filename))
	}
	return deps
}

const readFileContents = async (filename: string) => {
	const file = await Fs.open(filename)
	const lines = []
	for await (const line of file.readLines()) {
		lines.push(line)
	}
	await file.close()
	return lines.join("\n")
}

const parseImports = (text: string, bag: Options): string[] => Pipe(
	(Parser.parse(text, bag).body as node[]),
	Array.Filter(x => x.type === "LocalStatement"),
	Array.Bind(traverse_imports_after_assignment),
	Array.Map(x => x.slice(1, -1)),// luaparse wraps strings in double quotes
)

// Ignore left side of assignment.
// Inspect right side for import function calls.
const traverse_imports_after_assignment = (n: assignment_local): string[] =>
	Array.Choose(n.init, x => {
		// ex. require "foo.lua"
		if (x.type === "StringCallExpression")
			return Option.Some(x.argument.raw)
		// ex. require("foo.lua")
		else if (
			x.type === "CallExpression"
			// It could be any function, so verify it's an import.
			&& x.base.type === "Identifier" && x.base.name === "require"
			&& Array.IsNonEmpty(x.arguments)
			&& x.arguments[0].type === "StringLiteral"
		)
			return Option.Some(x.arguments[0].raw)
		else
			// It's some other assignment statement.
			// Maybe we've gone past imports and hit other assignments
			return Option.None()
	})
