import type { PartialMessage, PluginBuild } from "esbuild"
import type { Checker } from "../nodejs.ts"

export const Esbuild = (check: Checker<void>) => ({
	name: "purity-seal",

	setup: (build: PluginBuild) => {
		build.initialOptions.metafile = true

		build.onEnd(buildResult => {
			if (buildResult.metafile === undefined) return {}
			const inputs = buildResult.metafile.inputs

			const warnings: PartialMessage[] = []
			const warn = (dependent: string, dependency: string, message: string) =>
				warnings.push({
					text: message,
					notes: [
						{ text: `Dependent: ${dependent}` },
						{ text: `Dependency: ${dependency}` },
					],
				})

			const errors: PartialMessage[] = []
			const error = (dependent: string, dependency: string, message: string) =>
				errors.push({
					text: message,
					notes: [
						{ text: `Dependent: ${dependent}` },
						{ text: `Dependency: ${dependency}` },
					],
				})

			for (const dependent in inputs) {
				for (const { path: dependency } of inputs[dependent]!.imports) {
					const result = check([dependent, dependency])
					switch (result._tag) {
						case "Pure":
							warn(dependent, dependency, `unhandled dependency`)
							break
						case "Allow":
							break
						case "Warn":
							warn(dependent, dependency, result.Message)
							break
						case "Deny":
							const reason = `Deny: ${result.Deps[0]} depends on ${result.Deps[1]}`
							error(dependent, dependency, reason)
							break
						default: result satisfies never
					}
				}
			}

			return { warnings, errors }
		})
	},
})
