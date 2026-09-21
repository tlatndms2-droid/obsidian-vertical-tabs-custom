# Vertical Tabs Custom — current handoff

Updated: 2026-09-21 (Asia/Seoul)

## Current implementation

- Version: 0.17.7-custom.3; plugin ID: vertical-tabs-custom.
- Adds desktop-only Folding Tab Group Mode to the existing native tab-list menu.
- Existing native group Hide/Show implementation from custom.1 is retained.
- Earlier statements that the custom implementation has not started are obsolete; history is available in Git.
- Source input: Folding_Tab_Group_Planning_Pack.zip (user file; not committed).

## User-approved behavior

- One folding bundle per outer side-by-side column; internal rows/columns keep their real Tab Groups.
- Rows-only workspace shares one Bar and cannot collapse its sole bundle.
- 38px left Bar, 16px overlapping-tab icon and rotated title near the top; icon/title sit below the header controls to avoid Windows caption buttons. Click toggles, right-click renames a real group, drag reorders columns within the same Window.
- Collapse/expand uses a 240ms eased width transition; contents hide after collapse finishes. Reduced-motion preferences disable transitions.
- Last expanded bundle cannot collapse. Other bundles do not automatically collapse.
- Selecting an internal tab expands its bundle; Bar expansion restores its last visible active tab.
- Existing Hide remains independent. Bar expansion does not unhide groups; explicitly activating a hidden tab shows that group.
- Group names share existing Vertical Tabs storage. Shared names follow screen order.
- Mode is shared across this Vault's Windows. Normal application shutdown preserves folding; plugin disable/manual reload clears folding state.
- Mobile Folding, cross-window bundle dragging and top/bottom bundle dropping are out of scope.

## Code and validation

- FoldingTabGroups service owns lifecycle, native menu integration, Bar interactions and local persistence.
- FoldingLayout is the pure grouping rule, covered by six Node tests.
- NativeGroupVisibilityMenu binds to the invoking document, including popouts, and tolerates the absent floating root during cold startup.
- Build: node node_modules/typescript/bin/tsc --noEmit --skipLibCheck; node esbuild.config.mjs production; copy manifest.json into dist.
- Tests: node --test tests/folding-layout.test.mjs.
- Lint: node node_modules/eslint/bin/eslint.js . (two pre-existing warnings, no errors).
- See FOLDING_VALIDATION.md for evidence and acceptance coverage.

## Sandbox and delivery boundaries

- Sandbox Vault: C:/Users/tlatn/Documents/Codex/FoldingSandbox-20260921
- Dedicated profile: C:/Users/tlatn/Documents/Codex/FoldingProfile-20260921
- CDP port: 19371; always rediscover the page target after restart.
- Final cold-start validation: Obsidian 1.13.7. Initial interaction checks also ran on 1.12.7.
- Evidence: C:/Users/tlatn/Documents/Codex/FoldingEvidence-20260921
- Leave the Sandbox open and its fixtures intact for user review. Do not modify the live Vault.
- Delivery tag: 0.17.7-custom.3.
- User explicitly requested stopping after GitHub Release creation. Do not re-download Release assets or run BRAT installation/update verification unless newly requested.
