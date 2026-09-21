import { App, Menu, Modal, Platform, Plugin, Setting, View, WorkspaceLeaf, WorkspaceParent, setIcon } from "obsidian";
import { DEFAULT_GROUP_TITLE, useViewState } from "src/models/ViewState";
import { localStorageService } from "src/stores/LocalStorageService";
import { EVENTS } from "src/constants/Events";
import { around } from "monkey-around";
import { foldingRoots, foldingWidths } from "./FoldingLayout";

type Node = Omit<WorkspaceParent, "children" | "type"> & {
	type: string;
	direction?: string;
	children: Node[];
	dimension?: number;
	insertChild(index: number, child: Node): void;
};
type FoldState = { collapsed: boolean; lastLeaf?: string };
type Saved = { enabled: boolean; bundles: Record<string, FoldState> };
type Bundle = { node: Node; root: Node; groups: Node[]; key: string; bar: HTMLButtonElement };
const STORAGE = "vertical-tabs-custom:folding-v1";

class RenameFoldGroup extends Modal {
	constructor(app: App, private owner: Document, private initial: string, private submit: (name: string) => void) { super(app); }
	onOpen() {
		this.owner.body.appendChild(this.containerEl);
		this.titleEl.setText("이름 변경");
		let name = this.initial;
		const confirm = () => { this.submit(name.trim() || DEFAULT_GROUP_TITLE); this.close(); };
		new Setting(this.contentEl).setName("그룹 이름").addText(text => {
			text.setValue(name).onChange(value => { name = value; });
			text.inputEl.addEventListener("keydown", event => { if (event.key === "Enter" && !event.isComposing) confirm(); if (event.key === "Escape") this.close(); });
		});
		new Setting(this.contentEl).addButton(button => button.setButtonText("확인").setCta().onClick(confirm))
			.addButton(button => button.setButtonText("취소").onClick(() => this.close()));
	}
	onClose() { this.contentEl.empty(); }
}

export class FoldingTabGroups {
	enabled = false;
	private states: Record<string, FoldState> = {};
	private bundles: Bundle[] = [];
	private quitting = false;
	private changingFocus = false;
	private timer: number | undefined;
	private disposed = false;
	private cleanup: Array<() => void> = [];
	private documents = new Set<Document>();
	private sizeObservers: ResizeObserver[] = [];

	constructor(private plugin: Plugin) {
		if (Platform.isMobile) return;
		const saved = localStorageService.load<Saved>(STORAGE);
		if (saved && typeof saved.enabled === "boolean" && saved.bundles && typeof saved.bundles === "object") {
			this.enabled = saved.enabled;
			for (const [key, value] of Object.entries(saved.bundles)) {
				if (value && typeof value.collapsed === "boolean") this.states[key] = value;
			}
		}
		const workspace = plugin.app.workspace;
		const activate = (leaf: WorkspaceLeaf) => this.activate(leaf);
		this.cleanup.push(around(workspace, {
			setActiveLeaf(old) {
				return function (leaf: WorkspaceLeaf, params?: boolean | { focus?: boolean }, focus?: boolean) {
					if (typeof params === "boolean") old.call(workspace, leaf, params, !!focus);
					else old.bind(workspace)(leaf, params);
					activate(leaf);
				};
			},
		}));
		plugin.registerEvent(workspace.on("layout-change", () => this.schedule()));
		plugin.registerEvent(workspace.on("active-leaf-change", leaf => this.activate(leaf)));
		plugin.registerEvent(workspace.on("window-open", () => this.schedule()));
		plugin.registerEvent(workspace.on("window-close", () => this.schedule()));
		plugin.registerEvent(workspace.on("quit", () => { this.quitting = true; this.save(); }));
		this.cleanup.push(useViewState.subscribe(() => this.schedule()));
		workspace.onLayoutReady(() => { if (!this.disposed) this.refresh(); });
	}
	setEnabled(enabled: boolean) {
		this.enabled = enabled;
		this.refresh();
		this.save();
	}
	private save() { localStorageService.save(STORAGE, { enabled: this.enabled, bundles: this.states }); }
	private schedule() {
		if (this.disposed || this.timer !== undefined) return;
		this.timer = window.setTimeout(() => { this.timer = undefined; this.refresh(); }, 40);
	}
	private groups(node: Node): Node[] {
		return node.type === "tabs" ? [node] : node.children.flatMap(child => this.groups(child));
	}
	private name(group: Node) { return useViewState.getState().groupTitles.get(group.id) || DEFAULT_GROUP_TITLE; }
	private weight(node: Node) {
		// Native dimensions include the Bar; flex distributes only the space after it.
		const parentWidth = node.containerEl.parentElement?.clientWidth || 0;
		return parentWidth && node.dimension ? Math.max(0, parentWidth * node.dimension / 100 - 38) : 100;
	}
	private updateBar(bundle: Bundle) {
		const name = bundle.groups.map(group => this.name(group)).join(" + ");
		bundle.bar.querySelector(".vt-fold-title")!.textContent = name;
		bundle.bar.setAttribute("aria-label", name);
	}
	private state(bundle: Bundle): FoldState { return this.states[bundle.key] ??= { collapsed: false }; }
	private clearUI() {
		for (const observer of this.sizeObservers) observer.disconnect();
		this.sizeObservers = [];
		for (const bundle of this.bundles) {
			bundle.bar.remove();
			bundle.node.containerEl.removeClass("vt-fold-node", "vt-fold-collapsed", "vt-fold-drop-before", "vt-fold-drop-after");
			bundle.node.containerEl.style.removeProperty("--vt-fold-weight");
		}
		this.bundles = [];
	}
	private refresh() {
		if (this.disposed) return;
		const workspace = this.plugin.app.workspace;
		if (!workspace.layoutReady) return;
		if (!this.enabled) { this.clearUI(); workspace.requestResize(); return; }
		const roots = new Set<Node>([workspace.rootSplit as unknown as Node]);
		for (const root of workspace.floatingSplit.children) roots.add(root as unknown as Node);
		const nodes = [...roots].flatMap(root => foldingRoots(root));
		if (nodes.length === this.bundles.length && nodes.every((node, index) => {
			const bundle = this.bundles[index]!;
			return node === bundle.node && this.groups(node).map(group => group.id).sort().join(",") === bundle.groups.map(group => group.id).sort().join(",");
		})) {
			for (const bundle of this.bundles) {
				bundle.groups = this.groups(bundle.node);
				this.updateBar(bundle);
				if (bundle.bar.ownerDocument.body.hasClass("vt-fold-resizing")) bundle.node.containerEl.style.setProperty("--vt-fold-weight", String(this.weight(bundle.node)));
			}
			this.apply(); return;
		}
		this.clearUI();
		for (const root of roots) {
			const doc = root.containerEl.ownerDocument;
			this.bindDocument(doc);
			let lastWidth = root.containerEl.clientWidth;
			const observer = new ResizeObserver(() => {
				const width = root.containerEl.clientWidth;
				if (width !== lastWidth) { lastWidth = width; this.schedule(); }
			});
			observer.observe(root.containerEl);
			this.sizeObservers.push(observer);
			for (const node of foldingRoots(root)) {
				const groups = this.groups(node);
				if (!groups.length) continue;
				const key = root.id + ":" + groups.map(group => group.id).sort().join(",");
				const bar = doc.win.createEl("button");
				bar.className = "vt-fold-bar";
				bar.type = "button";
				const icon = bar.createSpan({ cls: "vt-fold-icon" });
				icon.setAttribute("aria-hidden", "true");
				setIcon(icon, "copy");
				bar.createSpan({ cls: "vt-fold-title" });
				const bundle: Bundle = { root, node, groups, key, bar };
				this.bundles.push(bundle);
				// Screen order is the workspace tree's top-to-bottom / left-to-right order.
				this.updateBar(bundle);
				bar.addEventListener("click", () => this.toggle(bundle));
				bar.addEventListener("contextmenu", event => { event.preventDefault(); this.renameMenu(bundle, event); });
				bar.addEventListener("pointerdown", event => this.drag(bundle, event));
				node.containerEl.addClass("vt-fold-node");
				node.containerEl.appendChild(bar);
				this.state(bundle);
			}
			const siblings = this.bundles.filter(bundle => bundle.root === root);
			if (siblings.length && siblings.every(bundle => this.state(bundle).collapsed)) this.state(siblings[0]!).collapsed = false;
		}
		this.apply();
		this.save();
	}
	private apply() {
		const active = this.plugin.app.workspace.getActiveViewOfType(View)?.leaf;
		for (const root of new Set(this.bundles.map(bundle => bundle.root))) {
			const siblings = this.bundles.filter(bundle => bundle.root === root);
			if (root.containerEl.ownerDocument.body.hasClass("vt-fold-resizing")) continue;
			const width = siblings[0]?.node.containerEl.parentElement?.clientWidth || root.containerEl.clientWidth;
			const widths = foldingWidths(width, siblings.map(bundle => ({ dimension: bundle.node.dimension, collapsed: this.state(bundle).collapsed })));
			for (let i = 0; i < siblings.length; i++) {
				siblings[i]!.node.containerEl.style.setProperty("--vt-fold-weight", String(Math.max(0, widths[i]! - 38)));
			}
		}
		for (const bundle of this.bundles) {
			const collapsed = this.state(bundle).collapsed;
			bundle.node.containerEl.toggleClass("vt-fold-collapsed", collapsed);
			bundle.bar.setAttribute("aria-expanded", String(!collapsed));
			bundle.bar.toggleClass("is-active", !!active && bundle.groups.some(group => group.id === active.parent.id));
		}
		this.plugin.app.workspace.requestResize();
	}
	private leaf(bundle: Bundle): WorkspaceLeaf | undefined {
		const state = this.state(bundle), hidden = useViewState.getState().hiddenGroups;
		const leaves = bundle.groups.filter(group => !hidden.includes(group.id)).flatMap(group => group.children as unknown as WorkspaceLeaf[]);
		return leaves.find(leaf => leaf.id === state.lastLeaf) ?? leaves[0];
	}
	private toggle(bundle: Bundle) {
		const state = this.state(bundle), workspace = this.plugin.app.workspace;
		if (!state.collapsed) {
			const others = this.bundles.filter(other => other.root === bundle.root && other !== bundle && !this.state(other).collapsed);
			if (!others.length) return;
			const active = workspace.getActiveViewOfType(View)?.leaf;
			if (active && bundle.groups.some(group => group.id === active.parent.id)) {
				state.lastLeaf = active.id;
				this.changingFocus = true;
				try { const next = others.map(other => this.leaf(other)).find(Boolean); if (next) workspace.setActiveLeaf(next, { focus: true }); }
				finally { this.changingFocus = false; }
			}
			state.collapsed = true;
		} else {
			state.collapsed = false;
			this.apply();
			const target = this.leaf(bundle);
			if (target) workspace.setActiveLeaf(target, { focus: true });
		}
		this.apply(); this.save();
	}
	private activate(leaf: WorkspaceLeaf | null) {
		if (!this.enabled || !leaf || this.changingFocus) return;
		const bundle = this.bundles.find(item => item.groups.some(group => group.id === leaf.parent.id));
		if (!bundle) { this.schedule(); return; }
		this.state(bundle).collapsed = false;
		this.state(bundle).lastLeaf = leaf.id;
		const view = useViewState.getState();
		if (view.hiddenGroups.includes(leaf.parent.id)) {
			view.toggleHiddenGroup(leaf.parent.id, false, this.plugin.app);
			this.plugin.app.workspace.trigger(EVENTS.UPDATE_TOGGLE);
		}
		this.apply(); this.save();
	}
	private renameMenu(bundle: Bundle, event: MouseEvent) {
		const edit = (group: Node) => new RenameFoldGroup(this.plugin.app, bundle.bar.ownerDocument, this.name(group), name => {
			useViewState.getState().setGroupTitle(group.id, name);
			this.refresh();
		}).open();
		const menu = new Menu();
		menu.addItem(item => {
			item.setTitle("이름 변경");
			if (bundle.groups.length === 1) item.onClick(() => edit(bundle.groups[0]!));
			else { const sub = item.setSubmenu(); for (const group of bundle.groups) sub.addItem(child => child.setTitle(this.name(group)).onClick(() => edit(group))); }
		});
		menu.showAtMouseEvent(event);
	}
	private bindDocument(doc: Document) {
		if (this.documents.has(doc)) return;
		this.documents.add(doc);
		let resizeFrame: number | undefined;
		const finishResize = () => {
			if (!doc.body.hasClass("vt-fold-resizing")) return;
			if (resizeFrame !== undefined) doc.defaultView?.cancelAnimationFrame(resizeFrame);
			resizeFrame = doc.defaultView?.requestAnimationFrame(() => {
				resizeFrame = undefined;
				this.refresh();
				// Commit native mouseup dimensions while transitions are still disabled.
				void doc.body.offsetWidth;
				doc.body.removeClass("vt-fold-resizing");
			});
		};
		const startResize = (event: PointerEvent) => {
			if (!this.enabled || event.button !== 0) return;
			const target = event.target as HTMLElement;
			if (target.closest?.(".workspace-leaf-resize-handle") && target.closest(".workspace")) doc.body.addClass("vt-fold-resizing");
		};
		doc.addEventListener("pointerdown", startResize, true);
		doc.addEventListener("pointerup", finishResize);
		doc.addEventListener("pointercancel", finishResize);
		doc.defaultView?.addEventListener("blur", finishResize);
		this.cleanup.push(() => {
			doc.removeEventListener("pointerdown", startResize, true);
			doc.removeEventListener("pointerup", finishResize);
			doc.removeEventListener("pointercancel", finishResize);
			doc.defaultView?.removeEventListener("blur", finishResize);
			if (resizeFrame !== undefined) doc.defaultView?.cancelAnimationFrame(resizeFrame);
			doc.body.removeClass("vt-fold-resizing");
		});
		const resized = (event: TransitionEvent) => {
			if (event.propertyName === "flex-grow" && (event.target as HTMLElement)?.classList?.contains("vt-fold-node")) this.plugin.app.workspace.requestResize();
		};
		doc.addEventListener("transitionend", resized);
		this.cleanup.push(() => doc.removeEventListener("transitionend", resized));
		// Only the main window closing signifies application shutdown.
		if (doc === this.plugin.app.workspace.containerEl.ownerDocument) {
			const closing = () => { this.quitting = true; this.save(); };
			doc.defaultView?.addEventListener("beforeunload", closing);
			this.cleanup.push(() => doc.defaultView?.removeEventListener("beforeunload", closing));
		}
	}
	private drag(bundle: Bundle, event: PointerEvent) {
		if (event.button !== 0 || bundle.node === bundle.root) return;
		const doc = bundle.bar.ownerDocument;
		let moving = false;
		let target: Bundle | undefined;
		let after = false;
		const clear = () => { for (const item of this.bundles) item.node.containerEl.removeClass("vt-fold-drop-before", "vt-fold-drop-after"); };
		const move = (current: PointerEvent) => {
			if (Math.hypot(current.clientX - event.clientX, current.clientY - event.clientY) < 6 && !moving) return;
			moving = true; clear();
			target = this.bundles.find(item => {
				if (item.root !== bundle.root || item === bundle || item.node.parent !== bundle.node.parent) return false;
				const box = item.node.containerEl.getBoundingClientRect();
				return current.clientX >= box.left && current.clientX <= box.right && current.clientY >= box.top && current.clientY <= box.bottom;
			});
			if (target) { const box = target.node.containerEl.getBoundingClientRect(); after = current.clientX > box.left + box.width / 2; target.node.containerEl.addClass(after ? "vt-fold-drop-after" : "vt-fold-drop-before"); }
		};
		const detach = () => { doc.removeEventListener("pointermove", move); doc.removeEventListener("pointerup", up); doc.removeEventListener("pointercancel", cancel); doc.removeEventListener("keydown", key); this.cleanup = this.cleanup.filter(callback => callback !== detach); clear(); };
		const cancel = () => { detach(); };
		const key = (current: KeyboardEvent) => { if (current.key === "Escape") cancel(); };
		const up = () => {
			detach();
			if (!moving) return;
			const stopClick = (click: MouseEvent) => { click.preventDefault(); click.stopImmediatePropagation(); };
			doc.addEventListener("click", stopClick, { capture: true, once: true });
			window.setTimeout(() => doc.removeEventListener("click", stopClick, true), 0);
			if (!target) return;
			const parent = bundle.node.parent as unknown as Node;
			const children = parent.children;
			// Reorder existing objects in one transaction: removeChild would collapse split ancestors.
			children.splice(children.indexOf(bundle.node), 1);
			const index = children.indexOf(target.node) + (after ? 1 : 0);
			parent.insertChild(index, bundle.node);
			this.plugin.app.workspace.requestSaveLayout();
			this.refresh();
		};
		doc.addEventListener("pointermove", move); doc.addEventListener("pointerup", up); doc.addEventListener("pointercancel", cancel); doc.addEventListener("keydown", key);
		this.cleanup.push(detach);
	}
	dispose() {
		this.disposed = true;
		if (this.timer !== undefined) window.clearTimeout(this.timer);
		if (!this.quitting) { this.enabled = false; this.states = {}; this.save(); }
		else this.save();
		this.clearUI();
		for (const cleanup of this.cleanup) cleanup();
		this.plugin.app.workspace.requestResize();
	}
}
