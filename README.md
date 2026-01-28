# Purity Seal Examples
- [Isolate Runtime Platforms](#isolate-runtime-platforms)
- [Enforce Onion Architecture](#enforce-onion-architecture)
- [Separate Business Logic from Library](#separate-business-logic-from-library)
- [The Kitchen Sink](#the-kitchen-sink)
- [Alternative](#alternative)
- [Reclassify](#reclassify)

### Isolate Runtime Platforms
```mermaid
graph BT;
	subgraph Fetch API
		http.ts
	end
	http.ts --> pure.ts

	subgraph Browser Main Thread
		dom.ts
	end
	dom.ts --> pure.ts

	subgraph Worker Thread Context
		worker.ts
	end
	worker.ts --> pure.ts

	subgraph NodeJS
		Assert.test.ts
	end
	Assert.test.ts --> pure.ts

	subgraph Build Entries
		Main.ts
		Foo.ts
		Bar.ts
		test.ts
	end

	Main.ts --> dom.ts
	Main.ts --> http.ts
	Foo.ts --> http.ts
	Foo.ts --> worker.ts
	Bar.ts --> worker.ts
	Bar.ts --> pure.ts
	test.ts --> pure.ts
	test.ts --> Assert.test.ts
```
```ts
const graph = PuritySeal.Classify({
	Unit: ["pure"],
	Commutative: ["http"],
	Exclusive: ["dom", "test", "worker"],
})
```

### Enforce Onion Architecture
```mermaid
graph BT;
	http.ts --> pure.ts
	state.ts --> pure.ts
	http.state.ts --> state.ts
	http.state.ts --> http.ts

```
```ts
const checker = Result.GetOrThrow(PS.Compare.ClassifyAndCompare(
	PS.Classify.File.FromExtensions(["http.state", "pure", "state", "http"]),
	PS.Compare.PartialOrder.Make([
		["http.state", ["state", "http"], "pure"],
	]),
))
```

### Separate Business Logic from Library
```mermaid
graph LR;
	domain.ts --> pure.ts
	math.ts --> domain.ts
	Main.ts --> math.ts
```
```ts
const graph = PuritySeal.Classify({
	Unit: ["pure"],
	Directional: [
		{ Dependent: "domain", Dependency: "pure" },
		{ Dependent: "math", Dependency: "pure" },
		{ Dependent: "math", Dependency: "domain" },
	],
})
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

	subgraph NodeJS
		Assert.test.ts
	end
	Assert.test.ts --> pure.ts

	subgraph Build Entries
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
