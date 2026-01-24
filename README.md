# Purity Seal Examples
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

	Cache.state.ts --> pure.ts

	subgraph HTTP Cache
		provider.ts
	end
	provider.ts --> Cache.state.ts
	provider.ts --> http.ts

	subgraph Build Entries
		Main.ts
	end

	Main.ts --> provider.ts
```
```ts
const graph = PuritySeal.Classify({
	Unit: ["pure"],
	Commutative: ["http", "state"],
	Composite: [
		["provider", ["http", "state"]],
	],
})
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
		{ dependent: "domain", dependency: "pure" },
		{ dependent: "math", dependency: "pure" },
		{ dependent: "math", dependency: "domain" },
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
		{ dependent: "domain", dependency: "pure" },
		{ dependent: "math", dependency: "pure" },
		{ dependent: "math", dependency: "domain" },
	],
})
```
