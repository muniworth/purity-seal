import { describe, it } from "node:test"
import { expect } from "expect"

import { Option } from "../../Lib/pure.ts"
import { Classify } from "../nodejs.ts"

await describe("Classify file by one extension", async () => {
	const classify = Classify.File.FromExtensions(["dom.http", "pure", "dom", "http"])

	await it("Fails if missing", () => {
		expect(classify("")).toEqual(Option.None())
		expect(classify("ts")).toEqual(Option.None())
		expect(classify(".ts")).toEqual(Option.None())
		expect(classify("Foo.ts")).toEqual(Option.None())
		expect(classify("Foo/Foo.ts")).toEqual(Option.None())
	})

	await it("Matches ID", () => {
		expect(classify("pure")).toEqual(Option.Some("pure"))
		expect(classify("dom")).toEqual(Option.Some("dom"))
		expect(classify("dom.http")).toEqual(Option.Some("dom.http"))
		expect(classify("http")).toEqual(Option.Some("http"))
	})

	await it("Matches simple", () => {
		expect(classify("pure.ts")).toEqual(Option.Some("pure"))
		expect(classify("Bar.http.ts")).toEqual(Option.Some("http"))
		expect(classify("foo_bar/pure.ts")).toEqual(Option.Some("pure"))
		expect(classify("foo_bar/Bar.pure.ts")).toEqual(Option.Some("pure"))
	})

	await it("Matches around other extensions", () => {
		expect(classify("Bar.http.baz.foo.ts")).toEqual(Option.Some("http"))
		expect(classify("Bar.baz.http.foo.ts")).toEqual(Option.Some("http"))
		expect(classify("Bar.baz.foo.http.ts")).toEqual(Option.Some("http"))
	})

	await it("Respects classification order", () => {
		expect(classify("dom.pure.ts")).toEqual(Option.Some("pure"))
		expect(classify("pure.dom.ts")).toEqual(Option.Some("pure"))
		expect(classify("pure.dom.http.ts")).toEqual(Option.Some("dom.http"))
		expect(classify("dom.http.pure.ts")).toEqual(Option.Some("dom.http"))
	})

	await it("Ignores filepath", () => {
		expect(classify("hello/dom.bar.baz.ts")).toEqual(Option.Some("dom"))
		expect(classify("hello.dom/dom.bar.baz.ts")).toEqual(Option.Some("dom"))
		expect(classify("hello.dom/dom.ts")).toEqual(Option.Some("dom"))

		expect(classify("hello.dom/bar.baz.ts")).toEqual(Option.None())
		expect(classify("dom/bar.baz.ts")).toEqual(Option.None())
	})
})

await describe("Classify file by glob extension", async () => {
	const classify = Classify.File.FromExtensions(["worker.nodejs", "api.state", "state", "api", "pure"])

	await it("Matches simple", () => {
		expect(classify("api.state.lua")).toEqual(Option.Some("api.state"))
		expect(classify("Foo.api.state.lua")).toEqual(Option.Some("api.state"))
	})

	await it("Ignores filepath", () => {
		expect(classify("Foo.pure/Foo.lua")).toEqual(Option.None())
		expect(classify("Foo.pure/Bar.api.state.lua")).toEqual(Option.Some("api.state"))
		expect(classify("api.state/pure.lua")).toEqual(Option.Some("pure"))
	})

	await it("Respects classification order", () => {
		expect(classify("Bar.worker.nodejs.aa.bb.lua")).toEqual(Option.Some("worker.nodejs"))
		expect(classify("Baarworker.nodejs.aa.bb.lua")).toEqual(Option.None())
		expect(classify("Barworker.nodejss.aa.bb.lua")).toEqual(Option.None())
		expect(classify("Bar.worker.aa.nodejs.bb.lua")).toEqual(Option.None())

		expect(classify("api.state.aa.bb.lua")).toEqual(Option.Some("api.state"))
		expect(classify("aa.api.state.bb.lua")).toEqual(Option.Some("api.state"))
		expect(classify("aa.bb.api.state.lua")).toEqual(Option.Some("api.state"))

		expect(classify("Bar.state.api.lua")).toEqual(Option.Some("state"))
		expect(classify("Bar.api.aa.state.bb.lua")).toEqual(Option.Some("state"))
		expect(classify("Bar.state.aa.api.bb.lua")).toEqual(Option.Some("state"))
	})
})
