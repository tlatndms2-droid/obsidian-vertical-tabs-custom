/** Obsidian's vertical direction means columns; a rows-only root is one bundle. */
export function foldingRoots<T extends { type: string; direction?: string; children: T[] }>(root: T): T[] {
	let base = root;
	while (base.type !== "tabs" && base.children.length === 1 && base.children[0]?.type !== "tabs") base = base.children[0]!;
	return base.type !== "tabs" && base.direction === "vertical" ? base.children : [base];
}

/** Reserve every rail, then redistribute only the visible content area. */
export function foldingWidths(width: number, items: { dimension?: number; collapsed: boolean }[], minimum = 260): number[] {
	const bar = 38;
	const result = items.map(() => bar);
	const open = items.map((item, i) => item.collapsed ? -1 : i).filter(i => i >= 0);
	if (!open.length) return result;
	let available = Math.max(0, width - bar * items.length);
	const floor = Math.min(Math.max(0, minimum - bar), available / open.length);
	const weights = items.map(item => Math.max(0, width * (item.dimension ?? 100 / items.length) / 100 - bar));
	let pending = open;
	while (pending.length) {
		const total = pending.reduce((sum, i) => sum + weights[i]!, 0);
		const share = (i: number) => total > 0 ? available * weights[i]! / total : available / pending.length;
		const small = pending.filter(i => share(i) < floor);
		if (!small.length) {
			for (const i of pending) result[i] = bar + share(i);
			break;
		}
		for (const i of small) { result[i] = bar + floor; available -= floor; }
		pending = pending.filter(i => !small.includes(i));
	}
	return result;
}
