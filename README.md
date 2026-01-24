# purity-seal
Language-agnostic dependency graph validation tool. Useful for fencing directories or enforcing architectural constraints.

# Examples
### Enforce Onion/Pure Architecture
```mermaid
graph BT;
	subgraph DOM API
		dom.ts
		Find.dom.ts
		Event.dom.ts
	end
	dom.ts --> Find.dom.ts
	dom.ts --> Event.dom.ts
	Event.dom.ts --> pure.ts

	subgraph HTTP
		http.ts
	end
	http.ts --> pure.ts

	subgraph State
		Cache.state.ts
	end
	Cache.state.ts --> pure.ts

	subgraph Composite Effect
		provider.ts
	end
	provider.ts --> Cache.state.ts
	provider.ts --> http.ts

	subgraph Worker Thread Context
		worker.ts
	end

	subgraph NodeJS
		Assert.test.ts
	end
	Assert.test.ts --> pure.ts

	subgraph Build entries
		Main.ts
		Foo.ts
		Bar.ts
		test.ts
	end

	Main.ts --> dom.ts
	Main.ts --> provider.ts
	Foo.ts --> provider.ts
	Foo.ts --> worker.ts
	Bar.ts --> worker.ts
	test.ts --> pure.ts
	test.ts --> Assert.test.ts
```

```ts
const onionArchitecture = PuritySeal.Classify({
	Pure: ["pure"],
	Platforms: ["dom", "test", "worker"],
	Effects: ["http", "state"],
	Composite: [
		["provider", ["http", "state"]],
	],
})
```
