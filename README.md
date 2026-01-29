# Purity Seal Examples
- [Enforce Onion Architecture](#enforce-onion-architecture)
- [Separate Business Logic from Library](#separate-business-logic-from-library)
- [Isolate Runtime Platforms](#isolate-runtime-platforms)
- [The Kitchen Sink](#the-kitchen-sink)
- [Alternative](#alternative)
- [Reclassify](#reclassify)

### Enforce Onion Architecture
```mermaid
graph BT;
	http.ts --> pure.ts
	state.ts --> pure.ts
	http.state.ts --> state.ts
	http.state.ts --> http.ts
```
```ts
const classify = PS.Classify.File.FromExtensions(["pure", "state", "http"])
const po = PS.Compare.PartialOrder.Make([
	["state.http", ["state", "http"], "pure"],
])
const plugin = PS.Pipe(
	PS.Compare.ClassifyAndCompare(classify, po),
	PS.Plugin.Esbuild,
)
```

### Separate Business Logic from Library
```mermaid
graph LR;
	domain.ts --> pure.ts
	math.ts --> domain.ts
```
```ts
const classify = PS.Classify.File.FromExtensions(["pure", "domain", "math"])
const po = PS.Compare.PartialOrder.Make([
	["math", "domain", "pure"],
])
const plugin = PS.Pipe(
	PS.Compare.ClassifyAndCompare(classify, po),
	PS.Plugin.Esbuild,
)
```

### Isolate Runtime Platforms
```mermaid
graph BT;
	Fetch.http.ts --> pure.ts
	dom.ts --> pure.ts
	worker.ts --> pure.ts
	Assert.test.ts --> pure.ts

	subgraph Builds
		browser.ts
		thread.ts
		test.ts
	end

	browser.ts --> dom.ts
	browser.ts --> Fetch.http.ts
	thread.ts --> Fetch.http.ts
	thread.ts --> worker.ts
	test.ts --> pure.ts
	test.ts --> Assert.test.ts
```
```ts
const classify = PS.Classify.File.FromExtensions([
	"pure", "http", "dom", "worker", "test", "browser", "thread",
])
const po = PS.Compare.PartialOrder.Make([
	["browser", ["http", "dom"], "pure"],
	["thread", ["http", "worker"], "pure"],
	["test", "pure"],
])
const plugin = PS.Pipe(
	PS.Compare.ClassifyAndCompare(classify, po),
	PS.Plugin.Esbuild,
)
```

### The Kitchen Sink
```mermaid
graph BT;
	subgraph Browser Main Thread
		dom.ts
		Find.dom.ts
		Event.dom.ts
	end
	dom.ts --> Find.dom.ts
	dom.ts --> Event.dom.ts
	Event.dom.ts --> pure.ts

	subgraph UI Components
		Button.ui.ts
		Feature.ui.ts
	end
	Button.ui.ts --> dom.ts
	Feature.ui.ts --> Button.ui.ts
	Feature.ui.ts --> provider.ts

	subgraph Fetch API
		http.ts
	end
	http.ts --> pure.ts

	Cache.state.ts --> pure.ts

	subgraph HTTP Cache
		provider.ts
	end
	provider.ts --> Cache.state.ts
	provider.ts --> http.ts

	subgraph Worker Thread Context
		worker.ts
	end
	worker.ts --> pure.ts

	Assert.test.ts --> pure.ts

	subgraph Builds
		Main.ts
		Foo.ts
		Bar.ts
		test.ts
	end

	Main.ts --> dom.ts
	Main.ts --> provider.ts
	Main.ts --> Feature.ui.ts
	Foo.ts --> provider.ts
	Foo.ts --> worker.ts
	Bar.ts --> worker.ts
	test.ts --> pure.ts
	test.ts --> Assert.test.ts
```
```ts
const graph = PuritySeal.Classify({
	Unit: ["pure"],
	Exclusive: ["dom", "test", "worker"],
	Commutative: ["http", "state"],
	Composite: [
		["provider", ["http", "state"]],
		["ui", ["provider", "dom"]],
	],
	Directional: [
		{ Dependent: "domain", Dependency: "pure" },
		{ Dependent: "math", Dependency: "pure" },
		{ Dependent: "math", Dependency: "domain" },
	],
})
```

### Alternative
For a given dependency and dependent, re-try using a different graph.
```ts
const allowExternal = PuritySeal.AsksWhen(
	x => x.Dependency.startsWith("node_modules"),
	PuritySeal.Allow(),
)
const allowKludge = PuritySeal.AsksWhen(
	x => x.Dependent === "filepath1" && (
		x.Dependency.includes("subpath1")
		|| x.Dependency.includes("subpath2")
	),
	PuritySeal.Allow(),
)
const graph = Pipe(
	PuritySeal.Classify({ Unit: ["pure"] }),
	PuritySeal.Alternative(allowExternal),
	PuritySeal.Alternative(allowKludge),
)
```

### Reclassify
Logically re-map a dependency to a new set of file extensions before validating against the graph.
```ts
const barHTTP = PuritySeal.Reclassify(
	dependency => dependency.startsWith("node_modules/bar"),
	["http"],
)
const graph = PuritySeal.Classify({
	Unit: ["pure"],
	Commutative: ["http", "state"],
	Reclassify: [barHTTP],
})
```
