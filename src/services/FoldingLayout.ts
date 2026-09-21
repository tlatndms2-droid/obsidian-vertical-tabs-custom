/** Obsidian's vertical direction means columns; a rows-only root is one bundle. */
export function foldingRoots<T extends { type: string; direction?: string; children: T[] }>(root: T): T[] {
	let base = root;
	while (base.type !== "tabs" && base.children.length === 1 && base.children[0]?.type !== "tabs") base = base.children[0]!;
	return base.type !== "tabs" && base.direction === "vertical" ? base.children : [base];
}
