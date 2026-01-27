import path from "node:path"

export const MatchExtension =
	<T extends string>(ext: T) =>
	(filepath: string): boolean =>
		path.basename(filepath).split(".").includes(ext)

export const MatchGlobExtension =
	<T extends string>(...exts: T[]) =>
	(filepath: string): boolean =>
		path.basename(filepath).includes(exts.join("."))
