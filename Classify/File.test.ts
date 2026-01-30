import { describe, it } from "node:test"
import { expect } from "expect"

import { Option } from "../Lib/pure.ts"
import { Classify } from "../nodejs.ts"

await describe("Classify file by extensions", async () => {
	await it("Fails if glob", () => {
		const x = (() => {
			try {
				Classify.Extensions(["http.state"])
			} catch (e) {
				return e instanceof Error ? e.message : "Expected an error"
			}
		})()
		expect(x).toEqual("File extensions may not contain a '.' character. Pass multiple extensions instead.")
	})

	const classify = Classify.Extensions(["pure", "dom", "http", "state"])

	await it("Fails if missing", () => {
		expect(classify("")).toEqual(Option.None())
		expect(classify("ts")).toEqual(Option.None())
		expect(classify(".ts")).toEqual(Option.None())
		expect(classify("Foo.ts")).toEqual(Option.None())
		expect(classify("Foo/Foo.ts")).toEqual(Option.None())
	})

	await it("Matches simple", () => {
		expect(classify("pure.ts")).toEqual(Option.Some("pure"))
		expect(classify("Bar.http.ts")).toEqual(Option.Some("http"))
		expect(classify("foo_bar/pure.ts")).toEqual(Option.Some("pure"))
		expect(classify("foo_bar/Bar.pure.ts")).toEqual(Option.Some("pure"))
	})

	await it("Ignores unrecognized extensions", () => {
		expect(classify("pure.d.ts")).toEqual(Option.Some("pure"))
		expect(classify("http.foo.ts")).toEqual(Option.Some("http"))
		expect(classify("foo.http.ts")).toEqual(Option.Some("http"))
	})

	await it("Matches glob extension to sorted glob", () => {
		expect(classify("dom.http.ts")).toEqual(Option.Some("dom.http"))
		expect(classify("http.dom.ts")).toEqual(Option.Some("http.dom"))
	})

	await it("Ignores filepath", () => {
		expect(classify("hello/dom.ts")).toEqual(Option.Some("dom"))
		expect(classify("hello.dom/pure.ts")).toEqual(Option.Some("pure"))
		expect(classify("hello.dom/dom.ts")).toEqual(Option.Some("dom"))
		expect(classify("dom/foo.ts")).toEqual(Option.None())
	})
})
