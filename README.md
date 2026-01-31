Purity Seal enforces dependency rules between files:

1. Classify files `filepath -> classification`, usually by file extension. *Classifiers are composable.*
2. Define a `partial order` that expresses dependency rules between file classifications. Partial orders may not contain cycles.
3. Create a checker from the classifier and partial order. Checkers input a `(dependent, dependency)` string pair, and output an `opinion`. *Checkers are composable.*
4. Run the checker against a dependency graph, typically using a build system plugin.

# Examples
- Dog food! Purity Seal [validates itself](https://github.com/muniworth/purity-seal/blob/main/Build.ts).
- [Enforce Onion Architecture](#enforce-onion-architecture)
- [Separate Business Logic from Library](#separate-business-logic-from-library)
- [Isolate Runtime Platforms](#isolate-runtime-platforms)
- [Multiple Classifiers](#multiple-classifiers)
- [Alternative Checkers](#alternative-checkers)

### Enforce Onion Architecture
```mermaid
graph BT;
	http.ts --> pure.ts
	state.ts --> pure.ts
	http.state.ts --> state.ts
	http.state.ts --> http.ts
```
```ts
const classify = PS.Classify.Extensions(["pure", "state", "http"])
const po = PS.PartialOrder.Make([
	[["http.state", "state.http"], ["state", "http"], "pure"],
])
const check = PS.Pipe(
	PS.Checker.Build(classify)(po),
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
const classify = PS.Classify.Extensions(["pure", "math", "domain"])
const po = PS.PartialOrder.Make([
	["math", "domain", "pure"],
])
const check = PS.Pipe(
	PS.Checker.Build(classify)(po),
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
const classify = PS.Classify.Extensions([
	"pure", "http", "dom", "worker", "test", "browser", "thread",
])
const po = PS.PartialOrder.Make([
	["browser", ["http", "dom"], "pure"],
	["thread", ["http", "worker"], "pure"],
	["test", "pure"],
])
const check = PS.Pipe(
	PS.Checker.Build(classify)(po),
	PS.Plugin.Esbuild,
)
```

### Multiple Classifiers
Third party code may follow different conventions.
```mermaid
graph BT;
	pure.ts --> Stats_Lib
	http.ts --> pure.ts
	http.ts --> HTTP_Lib
	http.ts --> Framework.cache
	dom.http --> http.ts
	dom.http ---> Framework
```
```ts
const libStats = PS.Classify.SetWhen(
	filepath => filepath.startsWith("node_modules/Stats"),
	_filepath => "pure",
)
const libHttp = PS.Classify.SetWhen(
	filepath => filepath === "node_modules/FancyHTTP/index.ts",
	_filepath => "http",
)
const libGlob = PS.Classify.SetWhen(
	filepath => filepath.startsWith("node_modules/framework"),
	filepath => filepath.includes("cache") ? "http" : "dom.http",
)
const classify = PS.Pipe(
	PS.Classify.Extensions(["pure", "http", "dom"]),
	PS.Classify.Catch(libStats),
	PS.Classify.Catch(libHttp),
	PS.Classify.Catch(libGlob),
)
const po = PS.PartialOrder.Make([
	["dom.http", ["dom", "http"], "pure"],
])
const check = PS.Pipe(
	PS.Checker.Build(classify)(po),
	PS.Plugin.Esbuild,
)
```

### Alternative Checkers
A checker does not have to form an opinion for a given node in the dependency graph. Instead, you can chain multiple checkers in a pipeline, which terminates when a checker forms an opinion.
```ts
const whitelist = new Set(["Source/Legacy/Foo.ts"])
const allowWhitelist = PS.Checker.AsksWhen(
	([x, y]) => whitelist.has(x) || whitelist.has(y),
	PS.Checker.Allow(),
)
const classify = PS.Pipe(
	PS.Classify.Extensions(["pure", "http"]),
)
const po = PS.PartialOrder.Make([
	["http", "pure"],
])
const check = PS.Pipe(
	PS.Checker.Build(classify)(po),
	PS.Checker.Then(allowWhitelist),
	PS.Plugin.Esbuild,
)
```
