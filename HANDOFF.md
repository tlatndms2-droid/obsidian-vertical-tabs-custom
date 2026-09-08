# Vertical Tabs Custom — Cross-PC Handoff

Last updated: 2026-09-08 (Asia/Seoul)

## 1. Current status

- This repository is an unmodified copy of upstream `oxdc/obsidian-vertical-tabs` release `0.17.7`, plus this handoff document.
- Upstream base commit: `3bd60496d37efef2cad6fca32bcd3ebcc40d3cff`
- Product implementation has **not started**.
- No build, Obsidian runtime test, BRAT release, tag, or GitHub Release has been completed for the custom version.
- Do not report the requested feature as implemented until the runtime acceptance checks in this document pass.

### 다른 PC에서 Codex에게 보낼 시작 지시문

```text
이 저장소의 HANDOFF.md를 처음부터 끝까지 읽고 현재 main, origin/main,
upstream 0.17.7 태그, manifest, GitHub 태그와 Release를 다시 확인해.
아직 기능은 구현되지 않았으며, 기존 Vertical Tabs를 새로 만들지 말고
기존 hiddenGroups/toggleHiddenGroup Hide 기능을 그대로 재사용해야 해.
HANDOFF의 Minimum implementation plan과 Acceptance tests 범위만 구현하고,
사용자의 실제 Vault가 아닌 격리된 Obsidian Sandbox에서 검증해.
빌드 성공만으로 완료라고 하지 말고 실제 작업 창 탭 드롭다운에서
전체 그룹 Hide/Show 토글과 사이드바 동기화를 확인해.
릴리스는 검증이 끝난 뒤에만 진행해.
```

## 2. User goal

Keep the existing Vertical Tabs plugin and its behavior, then add one small access point:

> In Obsidian's native workspace tab dropdown—the menu opened from the small down-chevron beside the horizontal tabs—show controls for the existing Vertical Tabs group `Hide/Show` feature.

This is a fork and small feature extension. It is **not** a new plugin designed from scratch and it must not reimplement the Hide engine.

### Existing behavior

- Each Vertical Tabs group header already has an eye/eye-off control.
- Existing state is stored in `useViewState().hiddenGroups`.
- Existing mutation is `toggleHiddenGroup(group.id, hidden, app)`.
- Existing UI calls `workspace.trigger(EVENTS.UPDATE_TOGGLE)` after changing visibility.
- `Group.tsx` applies/removes `is-hidden` on the real workspace group.

### Requested behavior

The native dropdown should look conceptually like this:

```text
Stack tabs
Continuous Mode  >
-------------------
Close all
-------------------
Vertical Tabs groups
  [eye]     0831 workspace
  [eye]     Video analysis
  [eye-off] Codex course
-------------------
Native list of tabs in this workspace group
```

- Show a **direct list**, not a submenu.
- Show **all Vertical Tabs workspace groups in the current Obsidian window**, not only the group whose dropdown was opened.
- Exclude left and right sidebar groups.
- Preserve the ordering already exposed by `tabCacheStore.groupIDs`.
- Use the user's saved group title; fall back to `Grouped tabs`.
- Visible group: `eye` icon. Hidden group: `eye-off` icon.
- Clicking a row toggles the existing Hide state and lets the native menu close normally.
- The sidebar icon and dropdown state must remain synchronized because they use the same store/action.
- Do not close tabs, detach leaves, recreate layouts, or implement a separate restore system.

## 3. Decisions already made

- Base version: upstream stable tag `0.17.7`, not upstream `master`.
- Reason: at planning time, `master` was 32 commits ahead of `0.17.7` while still reporting version `0.17.7`; unreleased changes should not be mixed into this small fork.
- Custom display name: `Vertical Tabs Custom`.
- Custom plugin ID: `vertical-tabs-custom`.
- Repository name: `obsidian-vertical-tabs-custom`.
- Distribution: GitHub Release installable through BRAT.
- Initial custom version/tag: `0.17.7-custom.1`.
- Original `vertical-tabs` should be disabled while the custom fork is active.
- Existing settings and group state should be copied once on first custom launch without deleting the original plugin's data.
- Menu presentation: direct group rows.
- Toggle result: native menu closes after one selection.

## 4. Source-grounded code map

Use the upstream `0.17.7` implementation as the source of truth.

- `src/components/Group.tsx`
  - Existing `setHidden()` and `toggleHidden()` behavior.
  - Calls `toggleHiddenGroup(group.id, hidden, app)` and `EVENTS.UPDATE_TOGGLE`.
  - Applies `is-hidden` to `group.containerEl`.
- `src/models/ViewState.ts`
  - Owns `hiddenGroups`, `groupTitles`, persistence, and `toggleHiddenGroup()`.
- `src/stores/TabCacheStore.ts`
  - Owns ordered `groupIDs` and the group content map.
- `src/services/GetTabs.ts`
  - Maps each root/floating `WorkspaceLeaf.parent.id` to a Vertical Tabs group.
- `src/main.ts`
  - Existing plugin setup and `monkey-around` patch registration location.
- `src/constants/Events.ts`
  - Contains `EVENTS.UPDATE_TOGGLE`.

## 5. Minimum implementation plan

### A. Preserve the fork identity

1. Change `manifest.json`:
   - `id`: `vertical-tabs-custom`
   - `name`: `Vertical Tabs Custom`
   - `version`: `0.17.7-custom.1`
2. Change matching package/version metadata required by the build and release workflow.
3. Preserve the MIT license and clearly attribute `oxdc/obsidian-vertical-tabs` in the README.
4. Separate plugin view IDs and event prefixes where required to prevent registration collisions.
5. Detect the original plugin being enabled and show a clear notice instead of registering duplicate workspace patches.

Do not refactor or rewrite unrelated Vertical Tabs features.

### B. Reuse the existing Hide action

Create one small service, for example `src/services/NativeGroupVisibilityMenu.ts`.

Responsibilities:

1. Detect activation of the native tab-list button `.workspace-tab-header-tab-list`.
2. Capture the owning `.workspace-tabs` element and its `ownerDocument`.
3. Intercept only the `Menu` instance created for that activation, before it renders.
4. Build the group rows from `tabCacheStore.getState()`:
   - iterate ordered `groupIDs`;
   - require `entry.groupType === GroupType.RootSplit`;
   - require a real `entry.group`;
   - require the group's container to belong to the captured `ownerDocument`;
   - exclude sidebar groups.
5. Insert a `Vertical Tabs groups` label and direct menu items after `Close all` and before the native tab rows.
6. For every row:
   - title = saved group title or `DEFAULT_GROUP_TITLE`;
   - icon = `eye-off` when `hiddenGroups` contains the group ID, otherwise `eye`;
   - callback = call the existing `toggleHiddenGroup()` with the inverse state, then trigger `EVENTS.UPDATE_TOGGLE`.
7. Prevent duplicate insertion with a menu-instance marker such as `WeakSet<Menu>`.
8. Register all patches/listeners through the plugin lifecycle and remove them on unload.

Prefer wrapping the native menu creation/show path with the project's existing `monkey-around` dependency. Do not replace the whole native menu or reproduce Obsidian's Stack/Continuous/Close/tab-selection commands.

### C. One-time state import

- Import existing `vertical-tabs` plugin settings only when the custom plugin has no settings yet.
- Copy relevant `0.17.7` state keys—group titles, hidden groups, collapsed groups, group order, non-ephemeral tab state, unhide times, and device-specific settings—to a `vertical-tabs-custom` namespace.
- Add a versioned migration marker so the import runs once.
- Never delete or modify the original plugin data during import.
- Keep the migration narrow; do not introduce a new general persistence framework.

## 6. Required runtime discovery

The exact Obsidian internal method that constructs this dropdown is not a public API and was not confirmed during planning.

Before editing the hook:

1. Use an isolated Obsidian Sandbox, not the user's real Vault.
2. Open the native tab dropdown and inspect the menu instance, item sections, and event order.
3. Confirm the correct insertion point without matching localized text such as `Close all`/`모두 닫기`.
4. Use native section metadata or item ordering. If the expected section structure is unavailable, append the custom section without breaking the native menu and document the compatibility fallback.

This discovery is a technical verification step, not permission to change the requested UX.

## 7. Acceptance tests

Automated/static:

- TypeScript check passes.
- ESLint passes.
- Production build passes.
- `dist/main.js`, `dist/manifest.json`, and `dist/styles.css` exist.
- Manifest ID and version match the custom release.

Sandbox interaction:

1. Create at least three root workspace groups and give them distinct titles.
2. Hide one group from the existing Vertical Tabs sidebar.
3. Open a workspace tab dropdown.
4. Confirm every current-window root group appears once and in Vertical Tabs order.
5. Confirm eye/eye-off icons reflect the existing sidebar state.
6. Toggle a visible non-current group from the dropdown; confirm it hides and the sidebar updates.
7. Reopen the dropdown and show it again; confirm the workspace and sidebar update.
8. Toggle the current group and confirm behavior matches the existing sidebar Hide action.
9. Confirm the menu closes after selection.
10. Confirm Stack tabs, Continuous Mode, Close all, and native tab selection still work.
11. Confirm unrelated context menus are unchanged.
12. Test renamed groups, split panes, a single-group workspace, and a pop-out window.
13. Reload Obsidian and confirm settings and visibility persistence.
14. Verify the one-time import copies existing state and leaves original data intact.
15. Enable the original plugin temporarily and confirm the custom fork refuses duplicate registration with an actionable notice.

## 8. BRAT release checklist

Only release after the acceptance tests pass.

1. Commit the implementation and updated handoff.
2. Push `main`.
3. Create annotated tag `0.17.7-custom.1` on the verified commit.
4. Build release artifacts from that commit.
5. Create a published GitHub Release—not a draft—with exactly:
   - `main.js`
   - `manifest.json`
   - `styles.css`
6. Verify the three downloaded assets and their manifest version.
7. Add this repository to BRAT on a clean Sandbox Vault.
8. Verify fresh installation, plugin enablement, and one update cycle.
9. Update this file with final commit, tag, release URL, test evidence, and any remaining limitations.

## 9. Resume instructions on another PC

```powershell
git clone https://github.com/tlatndms2-droid/obsidian-vertical-tabs-custom.git
Set-Location obsidian-vertical-tabs-custom
git remote add upstream https://github.com/oxdc/obsidian-vertical-tabs.git
git fetch upstream --tags
git remote -v
git status --short --branch
```

Then:

1. Read this entire `HANDOFF.md`.
2. Verify `HEAD`, `origin/main`, upstream tag `0.17.7`, GitHub tags, and releases before trusting recorded status.
3. Confirm there are no uncommitted user changes before editing.
4. Start with the native dropdown runtime discovery in section 6.
5. Implement only the minimum extension in section 5.
6. Do not claim completion before section 7 passes.

## 10. Explicit non-goals

- Do not rewrite Vertical Tabs from scratch.
- Do not implement a second Hide/Show state system.
- Do not close and restore tab layouts as a substitute for visibility.
- Do not redesign the Vertical Tabs sidebar.
- Do not import upstream `master` changes into the initial custom release.
- Do not alter the user's real Vault during development or testing.
- Do not release automatically merely because the build succeeds.
