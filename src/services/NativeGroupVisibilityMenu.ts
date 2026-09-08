import { App, Menu, MenuItem, MenuPositionDef } from "obsidian";
import { around } from "monkey-around";
import { EVENTS } from "src/constants/Events";
import { GroupType } from "src/models/VTWorkspace";
import { DEFAULT_GROUP_TITLE, useViewState } from "src/models/ViewState";
import { tabCacheStore } from "src/stores/TabCacheStore";

const MENU_SECTION = "close";

function isTabListMenu(menu: Menu) {
	return menu.items.some(
		(item) => item instanceof MenuItem && item.section === "close"
	) && menu.items.some(
		(item) => item instanceof MenuItem && item.section === "tablist"
	);
}

function addGroupVisibilityItems(
	app: App,
	menu: Menu,
	ownerDocument: Document
) {
	const { content, groupIDs } = tabCacheStore.getState();
	const groups = groupIDs
		.map((id) => ({ id, entry: content.get(id) }))
		.filter(
			({ entry }) =>
				entry.groupType === GroupType.RootSplit &&
				entry.group !== null &&
				entry.group.containerEl.ownerDocument === ownerDocument
		);
	if (groups.length === 0) return;

	const firstCustomItem = menu.items.length;
	menu.addItem((item) => {
		item.setSection(MENU_SECTION)
			.setTitle("Vertical Tabs groups")
			.setDisabled(true);
	});

	const { groupTitles, hiddenGroups, toggleHiddenGroup } =
		useViewState.getState();
	groups.forEach(({ id, entry }) => {
		const group = entry.group;
		if (!group) return;
		const isHidden = hiddenGroups.includes(id);
		menu.addItem((item) => {
			item.setSection(MENU_SECTION)
				.setTitle(groupTitles.get(id) || DEFAULT_GROUP_TITLE)
				.setIcon(isHidden ? "eye-off" : "eye")
				.onClick(() => {
					toggleHiddenGroup(id, !isHidden, app);
					app.workspace.trigger(EVENTS.UPDATE_TOGGLE);
				});
		});
	});
	menu.addSeparator();

	const customItems = menu.items.splice(firstCustomItem);
	const tabListIndex = menu.items.findIndex(
		(item) => item instanceof MenuItem && item.section === "tablist"
	);
	menu.items.splice(tabListIndex, 0, ...customItems);
}

export function registerNativeGroupVisibilityMenu(app: App) {
	const insertedMenus = new WeakSet<Menu>();

	const addItemsBeforeMenuRender = (menu: Menu, ownerDocument: Document) => {
		if (insertedMenus.has(menu) || !isTabListMenu(menu)) return;
		insertedMenus.add(menu);
		addGroupVisibilityItems(app, menu, ownerDocument);
	};

	const unpatch = around(Menu.prototype, {
		showAtPosition(old) {
			return function (
				this: Menu,
				position: MenuPositionDef,
				doc?: Document
			) {
				addItemsBeforeMenuRender(
					this,
					doc ?? app.workspace.containerEl.doc
				);
				return old.call(this, position, doc);
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
		unpatch();
	};
}
