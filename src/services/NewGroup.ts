import { App, WorkspaceLeaf } from "obsidian";

/** Split beside the specified native tab group without copying its open file. */
export async function openEmptyGroupRight(app: App, source: WorkspaceLeaf): Promise<void> {
	const leaf = app.workspace.createLeafBySplit(source, "vertical", false);
	await leaf.setViewState({ type: "empty", state: {}, active: true });
	app.workspace.setActiveLeaf(leaf, { focus: true });
}
