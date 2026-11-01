import { App, Menu, MenuItem, MenuPositionDef } from "obsidian";
import { around } from "monkey-around";
import type { FoldingTabGroups } from "./FoldingTabGroups";


function isTabListMenu(menu: Menu) {
	return menu.items.some(
		(item) => item instanceof MenuItem && item.section === "close"
	) && menu.items.some(
		(item) => item instanceof MenuItem && item.section === "tablist"
	);
}

export function registerNativeGroupVisibilityMenu(app: App, folding: FoldingTabGroups | null = null) {
	const insertedMenus = new WeakSet<Menu>();
	let invokingDocument: Document | undefined;
	const bound = new Map<Document, EventListener>();
	const bindDocuments = () => {
		const docs = [app.workspace.containerEl.ownerDocument, ...(app.workspace.floatingSplit?.children ?? []).map(root => root.containerEl.ownerDocument)];
		for (const doc of docs) {
			if (bound.has(doc)) continue;
			const capture: EventListener = event => {
				const target = event.target as Element | null;
				if (target?.closest?.(".workspace-tab-header-tab-list:not(.vt-mission-control-toggle-button)")) invokingDocument = doc;
			};
			doc.addEventListener("mousedown", capture, true);
			bound.set(doc, capture);
		}
	};
	bindDocuments();
	const opened = app.workspace.on("window-open", bindDocuments);

	const addItemsBeforeMenuRender = (menu: Menu, ownerDocument: Document) => {
		if (insertedMenus.has(menu) || !isTabListMenu(menu)) return;
		insertedMenus.add(menu);
		if (folding) menu.addItem(item => item.setSection("close").setTitle("Folding Tab Group Mode").setChecked(folding.enabled).onClick(() => folding.setEnabled(!folding.enabled)));
	};

	const unpatch = around(Menu.prototype, {
		showAtPosition(old) {
			return function (
				this: Menu,
				position: MenuPositionDef,
				doc?: Document
			) {
				const owner = isTabListMenu(this) ? invokingDocument ?? doc ?? app.workspace.containerEl.doc : doc;
				addItemsBeforeMenuRender(
					this,
					owner ?? app.workspace.containerEl.doc
				);
				invokingDocument = undefined;
				return old.call(this, position, owner);
			};
		},
		showAtMouseEvent(old) {
			return function (this: Menu, event: MouseEvent) {
				addItemsBeforeMenuRender(
					this,
					event.view?.document ?? app.workspace.containerEl.doc
				);
				return old.call(this, event);
			};
		},
	});

	return () => {
		app.workspace.offref(opened);
		for (const [doc, capture] of bound) doc.removeEventListener("mousedown", capture, true);
		unpatch();
	};
}
