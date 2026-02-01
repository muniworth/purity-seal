import * as esbuild from "esbuild"
import * as Process from "node:process"
import * as PS from "./nodejs.ts"

const prod = Process.argv.includes("--prod")
const watch = !Process.argv.includes("--once")

const classify = PS.Pipe(
	PS.Classify.Extensions(["pure", "nodejs", "test"]),
	PS.Classify.Catch(PS.Classify.SetWhen(
		fp => fp.startsWith("node:"),
		_ => "nodejs",
	)),
)
const po = PS.PartialOrder.Make([
	["nodejs", "pure"],
	["test", "pure"],
])
const check = PS.Pipe(
	PS.Checker.Build(classify)(po),
	PS.Plugin.Esbuild,
)

const esbuild_config = await esbuild.context({
	bundle: true,
	entryPoints: ["nodejs.ts"],
	format: "esm",
	minify: false,
	outdir: "build_output_global_var",
	plugins: [check],
	platform: "node",
	sourcemap: prod ? false : "inline",
	// Node's --enable-source-maps works with inline sourcemaps
	// External and Linked don't seem to output extra files?
	sourcesContent: false,
	splitting: false,
	target: "esnext",
	tsconfig: "tsconfig.json",
	write: false,
})

const contexts = [esbuild_config]
// build = rebuild >> dispose >> printSummary
// https://github.com/evanw/esbuild/issues/3677
await Promise.all(contexts.map(ctx => ctx.rebuild()))
await Promise.all(contexts.map(ctx => ctx.dispose()))
