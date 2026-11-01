import { ItemView, Platform, Plugin, PluginSettingTab, Setting, WorkspaceLeaf } from "obsidian";
import { FoldingTabGroups } from "./services/FoldingTabGroups";
import { registerNativeGroupVisibilityMenu } from "./services/NativeGroupVisibilityMenu";
import { openEmptyGroupRight } from "./services/NewGroup";
import { localStorageService } from "./stores/LocalStorageService";
import { groupNames } from "./services/GroupNames";

interface Settings { foldingAnimation: boolean; zenMode: boolean; showActiveTabsInZenMode: boolean; }
export default class FoldingZenPlugin extends Plugin {
 settings: Settings = { foldingAnimation: true, zenMode: false, showActiveTabsInZenMode: false };
 folding: FoldingTabGroups | null = null;
 private buttons = new Map<WorkspaceLeaf, { view: ItemView; element: HTMLElement }>();
 private lastMainLeaf: WorkspaceLeaf | null = null;
 private marked = new Set<Element>();
 private ribbon?: HTMLElement;
 private disposed = false;
 async onload() {
  const saved = await this.loadData();
  for (const key of Object.keys(this.settings) as (keyof Settings)[]) {
   if (typeof saved?.[key] === "boolean") this.settings[key] = saved[key];
  }
  localStorageService.init(this.app); groupNames.load();
  if (Platform.isDesktop) {
   this.folding = new FoldingTabGroups(this);
   this.folding.setAnimationEnabled(this.settings.foldingAnimation);
   this.register(registerNativeGroupVisibilityMenu(this.app, this.folding));
  }
  this.addCommand({ id: "toggle-zen-mode", name: "Toggle zen mode", callback: () => { void this.toggleZen(); } });
  this.addCommand({ id: "new-group-right", name: "오른쪽에 새 그룹과 빈 탭 열기", checkCallback: checking => {
   const leaf = this.app.workspace.getMostRecentLeaf();
   if (!leaf || !Platform.isDesktop || leaf.getRoot() === this.app.workspace.leftSplit || leaf.getRoot() === this.app.workspace.rightSplit) return false;
   if (!checking) void openEmptyGroupRight(this.app, leaf);
   return true;
  }});
  this.ribbon = this.addRibbonIcon("focus", "Toggle zen mode", () => { void this.toggleZen(); });
  this.addSettingTab(new FocusSettings(this.app, this));
  this.registerEvent(this.app.workspace.on("active-leaf-change", leaf => {
   if (leaf?.getRoot() === this.app.workspace.rootSplit) this.lastMainLeaf = leaf;
   this.updateZen(); this.updateButtons();
  }));
  this.registerEvent(this.app.workspace.on("layout-change", () => { this.updateZen(); this.updateButtons(); }));
  this.registerEvent(this.app.workspace.on("file-open", () => this.updateButtons()));
  this.app.workspace.onLayoutReady(() => {
   if (this.disposed) return;
   // Remove the retired panel from a saved workspace without opening any files.
   this.app.workspace.getLeavesOfType("vertical-tabs-custom").forEach(leaf => leaf.detach());
   this.updateZen(); this.updateButtons();
  });
 }
 async saveSettings() { await this.saveData(this.settings); }
 async toggleZen() {
  this.settings.zenMode = !this.settings.zenMode;
  this.updateZen(); this.updateButtons(); await this.saveSettings();
 }
 updateZen() {
  if (this.disposed) return;
  const workspace = this.app.workspace, root = workspace.rootSplit.containerEl;
  const active = workspace.getMostRecentLeaf();
  if (active?.getRoot() === workspace.rootSplit) this.lastMainLeaf = active;
  if (!this.lastMainLeaf?.containerEl.isConnected) {
   this.lastMainLeaf = null;
   workspace.iterateAllLeaves(leaf => { if (!this.lastMainLeaf && leaf.getRoot() === workspace.rootSplit) this.lastMainLeaf = leaf; });
  }
  const next = new Set<Element>();
  let element: HTMLElement | undefined = this.lastMainLeaf?.parent?.containerEl;
  while (element && element !== root) { next.add(element); element = element.parentElement ?? undefined; }
  let changed = false;
  for (const old of this.marked) if (!next.has(old)) { old.classList.remove("vt-zen-path"); changed = true; }
  for (const el of next) if (!this.marked.has(el)) { el.classList.add("vt-zen-path"); changed = true; }
  this.marked = next;
  const enabled = this.settings.zenMode && !!this.lastMainLeaf;
  if (root.classList.contains("vt-zen-root") !== enabled) { root.classList.toggle("vt-zen-root", enabled); changed = true; }
  root.classList.toggle("vt-zen-hide-tabs", this.settings.showActiveTabsInZenMode);
  if (changed) workspace.requestResize();
 }
 private updateButtons() {
  if (this.disposed) return;
  for (const [leaf, entry] of this.buttons) {
   if (!leaf.containerEl.isConnected || leaf.view !== entry.view || !entry.element.isConnected) { entry.element.remove(); this.buttons.delete(leaf); }
  }
  this.app.workspace.iterateAllLeaves(leaf => {
   if (leaf.getRoot() !== this.app.workspace.rootSplit || !(leaf.view instanceof ItemView) || this.buttons.has(leaf)) return;
   const element = leaf.view.addAction("focus", "Toggle zen mode", () => { this.app.workspace.setActiveLeaf(leaf, { focus: true }); void this.toggleZen(); });
   element.addClass("vt-zen-toggle"); this.buttons.set(leaf, { view: leaf.view, element });
  });
  for (const element of [this.ribbon, ...[...this.buttons.values()].map(entry => entry.element)]) {
   element?.classList.toggle("is-active", this.settings.zenMode);
   if (element?.getAttribute("aria-pressed") !== String(this.settings.zenMode)) element?.setAttribute("aria-pressed", String(this.settings.zenMode));
  }
 }
 onunload() {
  this.disposed = true; this.folding?.dispose();
  for (const {element} of this.buttons.values()) element.remove();
  for (const el of this.marked) el.classList.remove("vt-zen-path");
  this.app.workspace.rootSplit.containerEl.removeClass("vt-zen-root", "vt-zen-hide-tabs");
  this.app.workspace.requestResize();
 }
}
class FocusSettings extends PluginSettingTab {
 declare plugin: FoldingZenPlugin;
 display() {
  this.containerEl.empty();
  new Setting(this.containerEl).setName("Folding · Zen").setHeading();
  new Setting(this.containerEl).setName("Folding Tab Group Mode").setDesc("그룹을 세로 막대로 접거나 펼칩니다. 탭 목록 메뉴에서도 전환할 수 있습니다.").addToggle(toggle => toggle.setValue(this.plugin.folding?.enabled ?? false).setDisabled(!this.plugin.folding).onChange(value => this.plugin.folding?.setEnabled(value)));
  new Setting(this.containerEl).setName("탭 그룹 접기·펼치기 애니메이션").setDesc("끄면 너비가 즉시 바뀝니다. 접힌 내용의 화면 계산 제외는 계속 적용됩니다.").addToggle(toggle => toggle.setValue(this.plugin.settings.foldingAnimation).onChange(async value => { this.plugin.settings.foldingAnimation = value; this.plugin.folding?.setAnimationEnabled(value); await this.plugin.saveSettings(); }));
  new Setting(this.containerEl).setName("Zen 모드").setDesc("현재 문서 그룹만 표시합니다. 끄면 기존 그룹 배치로 돌아갑니다.").addToggle(toggle => toggle.setValue(this.plugin.settings.zenMode).onChange(async value => { if (value !== this.plugin.settings.zenMode) await this.plugin.toggleZen(); }));
  new Setting(this.containerEl).setName("Zen 모드에서 비활성 탭 숨기기").addToggle(toggle => toggle.setValue(this.plugin.settings.showActiveTabsInZenMode).onChange(async value => { this.plugin.settings.showActiveTabsInZenMode = value; this.plugin.updateZen(); await this.plugin.saveSettings(); }));
 }
}
