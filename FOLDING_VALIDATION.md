# Folding Tab Group Mode validation

Date: 2026-09-21. Final version: 0.17.7-custom.2.

## Automated checks

- TypeScript: pass.
- Six grouping tests: pass (single, rows-only, nested B/C over D, wrappers, popout columns, native tab separation).
- ESLint: zero errors. Existing warnings remain in Migration.ts (localStorage) and SettingTab.ts (deprecated display).
- Production build: pass.
- Built and installed main.js, manifest.json and styles.css SHA-256 match.

## Planning-pack acceptance coverage

| Criteria | Verification and result |
|---|---|
| 1–6 Mode | Native dropdown clicks; first ON expanded; OFF removes Bars; ON restores collapse; main/popout mode sync and new-window inheritance passed. |
| 7–11 Bars | Actual screenshots and bounding boxes: left Bars, 22px both states, upright text, no icons, long name ellipsis, active style. |
| 12–19 Folding | Actual Bar clicks: only selected bundle collapses; child content hides; A uses released width; last/single bundle remains expanded without notification. |
| 20–26 Shared bundle | A beside B/C over D; two Bars for four actual groups; internal structure and last C2 focus retained. Rows-only layout has one protected Bar. |
| 27–32 Names | Single and shared context menu edits; shared group picker edits only chosen group; sidebar edit updates Bar; common existing group title storage. Popout edit dialog verified in that window. |
| 33–37 Layout | Actual mouse dragging for expanded and collapsed bundles; original group/leaf identities retained; native C2 tab drag creates a new real group and recalculates membership. New membership starts expanded. |
| 38–42 Activation | Sidebar C1/C2 selection, same-active hidden C2 selection, command-palette QA command using the common workspace activation path. Expansion remains until Bar click. Search/link UIs were not separately enumerated; their resulting workspace tab activation is handled by the same hook. |
| 43–45 Existing views | Native Stack tabs toggle retained through fold/unfold; Markdown and Canvas file/view contents preserved. Folding does not write note or Canvas contents. |
| 46–49 Lifecycle | Normal close via native titlebar button, new process and new CDP target: mode ON, B+C+D collapsed, layout and 22px Bars restored. No startup errors. Manual disable/re-enable resets mode and removes UI. |
| 50–51 Platform | Windows desktop runtime passed. Mobile explicitly excluded; desktop guard verified in source. |

## User-approved additions

- Hide remains independent: hidden C remains hidden after fold/unfold; direct C selection reveals it.
- Bar drag only reorders siblings in the same Window, without flattening nested splits.
- No destructive document operations or real-Vault changes.

## Evidence

Local evidence directory: C:/Users/tlatn/Documents/Codex/FoldingEvidence-20260921

- checks.json: recorded runtime assertions.
- after-restart.json and after-restart.png: final cold-start state.
- Pre-test workspace backup: C:/Users/tlatn/Documents/Codex/FoldingBackup-20260921.
- Sandbox remains available with A / B+C+D; B+C+D is collapsed.

Final local artifact SHA-256:

- main.js: 25E1B4DA48FC05BCDE9341FE4C9B3D59F13336F111E0BE6B8F39731E553C6EFF
- manifest.json: 0B88CB167614B816324ED9B1E8A5397289B0C947F72632B7D4545C2FCAA01E85
- styles.css: 909A1299B9190DED5D75E213105F03A444A208BC7091A7129DDBC5CB3145764E

## Delivery boundary

Release asset re-download and BRAT installation/update checks are intentionally omitted at the user's request. User installation verification is separate from the local Sandbox results above.
