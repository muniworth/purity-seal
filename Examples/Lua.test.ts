import { describe, it } from "node:test"
import { expect } from "expect"

import * as PS from "../nodejs.ts"

await describe("Lua", async () => {
	const classify = PS.Classify.Extensions([
		"pure", "game", "test",
	])
	const po = PS.PartialOrder.Make([
		["game", "pure"],// Game engine
		["test", "pure"],// CLI
	])
	const check = PS.Checker.Build(classify)(po)

	await it("Allows valid build", async () => {
		const deps = await PS.Plugin.Lua.BuildDeps(
			["Pass.game.lua", "Pass.test.lua"],
			{ luaVersion: "5.1", resolveModule: x => "Examples/Fixtures/" +  x },
		)
		const out = PS.Checker.Validate(check, deps)
		const exp: typeof out = { deny: [], warn: [] }
		expect(out).toEqual(exp)
	})

	await it("Denies invalid build", async () => {
		const deps = await PS.Plugin.Lua.BuildDeps(
			["Fail.game.lua"],
			{ luaVersion: "5.1", resolveModule: x => "Examples/Fixtures/" +  x },
		)
		const out = PS.Checker.Validate(check, deps)
		const exp: typeof out = {
			deny: [["Examples/Fixtures/Fail.game.lua", "Examples/Fixtures/Fail.test.lua"]],
			warn: [],
		}
		expect(out).toEqual(exp)
	})
})
