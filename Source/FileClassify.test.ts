import { describe, it } from "node:test"
import { expect } from "expect"

import { Option } from "../Lib/pure.ts"
import type { Classifier } from "./ClassifyAndCompare.pure.ts"
import * as FileClassify from "./FileClassify.nodejs.ts"

await describe("Classify file by one extension", async () => {
	const hasExtension = FileClassify.MatchExtension("foo")

	await it("Matches only extension", () => {
		expect(hasExtension("foo.ts")).toEqual(true)
	})

	await it("Matches name with extension", () => {
		expect(hasExtension("bar.foo.ts")).toEqual(true)
	})

	await it("Matches last extension", () => {
		expect(hasExtension("bar.baz.foo.ts")).toEqual(true)
	})

	await it("Matches first extension", () => {
		expect(hasExtension("foo.bar.baz.ts")).toEqual(true)
	})

	await it("Matches middle extension", () => {
		expect(hasExtension("bar.foo.baz.ts")).toEqual(true)
	})

	await it("Fails if missing extension", () => {
		expect(hasExtension("bar.moo.baz.ts")).toEqual(false)
	})

	await it("Ignores filepath", () => {
		expect(hasExtension("hello/foo.bar.baz.ts")).toEqual(true)
		expect(hasExtension("hello.foo/foo.bar.baz.ts")).toEqual(true)
		expect(hasExtension("hello.foo/foo.ts")).toEqual(true)
		expect(hasExtension("hello.foo/bar.baz.ts")).toEqual(false)
		expect(hasExtension("foo/bar.baz.ts")).toEqual(false)
	})
})

await describe("Classify file by multiple extensions", async () => {
	const hasExtension = FileClassify.MatchExtension("aa.bb")

	await it("Matches only provided extensions", () => {
		expect(hasExtension("aa.bb.lua")).toEqual(true)
	})

	await it("Matches name with glob extension", () => {
		expect(hasExtension("bar.aa.bb.lua")).toEqual(true)
	})

	await it("Matches last glob extension", () => {
		expect(hasExtension("bar.aa.bb.lua")).toEqual(true)
	})

	await it("Matches first glob extension", () => {
		expect(hasExtension("aa.bb.baz.lua")).toEqual(true)
	})

	await it("Matches middle glob extension", () => {
		expect(hasExtension("bar.aa.bb.moo.lua")).toEqual(true)
	})

	await it("Fails on out-of-order glob extensions", () => {
		expect(hasExtension("bar.aa.moo.bb.lua")).toEqual(false)
		expect(hasExtension("bar.bb.moo.aa.lua")).toEqual(false)
		expect(hasExtension("bar.bb.aa.moo.lua")).toEqual(false)
	})

	await it("Fails if missing all extensions", () => {
		expect(hasExtension("bar.moo.baz.lua")).toEqual(false)
	})

	await it("Fails if missing any extensions", () => {
		expect(hasExtension("bar.aa.baz.lua")).toEqual(false)
		expect(hasExtension("bar.moo.bb.lua")).toEqual(false)
	})

	await it("Ignores filepath", () => {
		expect(hasExtension("hello/bar.aa.bb.moo.lua")).toEqual(true)
		expect(hasExtension("aa.bb/aa.bb.lua")).toEqual(true)
		expect(hasExtension("foo.aa.bb/foo.aa.bb.lua")).toEqual(true)
		expect(hasExtension("aa.bb/foo.lua")).toEqual(false)
		expect(hasExtension("foo.aa.bb/foo.lua")).toEqual(false)
	})
})

await describe("Classifier works for a few extensions", async () => {
	const classify: Classifier<"pure" | "dom" | "dom.http" | "http"> = FileClassify
		.FromExtensions(["dom.http", "pure", "dom", "http"])

	await it("Fails with wrong extensions", () => {
		expect(classify("foo")).toEqual(Option.None())
		expect(classify("foo/bar")).toEqual(Option.None())

		expect(classify("foo.moo")).toEqual(Option.None())
		expect(classify("foo/bar.moo")).toEqual(Option.None())
	})

	await it("Matches extensions without path", () => {
		expect(classify("pure")).toEqual(Option.Some("pure"))
		expect(classify("dom")).toEqual(Option.Some("dom"))
		expect(classify("dom.http")).toEqual(Option.Some("dom.http"))
		expect(classify("http")).toEqual(Option.Some("http"))

		expect(classify("foo.pure")).toEqual(Option.Some("pure"))
		expect(classify("foo.dom")).toEqual(Option.Some("dom"))
		expect(classify("foo.dom.http")).toEqual(Option.Some("dom.http"))
		expect(classify("foo.http")).toEqual(Option.Some("http"))
	})

	await it("Matches extensions with path", () => {
		expect(classify("bar/foo.pure")).toEqual(Option.Some("pure"))
		expect(classify("bar/foo.dom")).toEqual(Option.Some("dom"))
		expect(classify("bar/foo.dom.http")).toEqual(Option.Some("dom.http"))
		expect(classify("bar/foo.http")).toEqual(Option.Some("http"))

		expect(classify("bar/foo.pure")).toEqual(Option.Some("pure"))
		expect(classify("bar/foo.dom")).toEqual(Option.Some("dom"))
		expect(classify("bar/foo.dom.http")).toEqual(Option.Some("dom.http"))
		expect(classify("bar/foo.http")).toEqual(Option.Some("http"))
	})
})
