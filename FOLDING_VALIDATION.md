# Folding Tab Group Mode validation

Date: 2026-09-21. Initial validation: 0.17.7-custom.2. Latest recorded validation: 0.17.7-custom.5 (see the versioned sections below).

Cross-PC handoff: selected custom.5 evidence is included in [handoff-assets/custom5](handoff-assets/custom5/README.md). Absolute paths below refer to the original PC and are historical evidence locations, not prerequisites on a new PC. This handoff did not repeat the runtime checks.

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

## 0.17.7-custom.3 design and motion validation (2026-09-21)

- TypeScript, production build and six layout tests passed. ESLint: zero errors, two existing warnings.
- Obsidian 1.13.7 isolated FoldingSandbox-20260921: actual Bar width 38px, icon 16px, rotated titles; screenshots compared with approved mockup.
- Caption-button collision was found and corrected by positioning icon/title below the header. Collapsed rightmost icon now accepts clicks.
- CDP pointer click exercised expansion and collapse. Recorded animation widths included 938, 856, 631, 301, 120, 72 and 38px instead of an instant jump.
- Keyboard activation, reactivation during transition, last-expanded-bundle protection and reduced-motion 0s transition checked. No captured page errors during interaction checks.
- Normal Sandbox process quit/relaunch preserved enabled mode, A expanded, B+C+D collapsed, icons and 38px bars on custom.3. Before/after snapshots matched exactly.
- Evidence: custom3-before-restart.json, custom3-after-restart.json, custom3-collapsed.png, custom3-after-restart.png in the evidence directory above; pre-test workspace/data backup in custom3-before.
- Final build/install SHA-256 matched: main.js A60F70C9FEAE3531441E49D364B4BF9C459BEA1519B30C4A42D2AD44939650F0; styles.css A471260ECCAA500861785B5545B178FB5F3C804BBA0A4CC402B49744A2AAB834; manifest.json F7717DA57F127FCE35C511DB93119A17F0C7043E32BD7EE3A5A0FD16FD92001A.

## Delivery boundary (unchanged)

## 0.17.7-custom.4 split resize fix (2026-09-21)

- Root cause: folding's important flex rule overrode Obsidian's temporary pixel widths during split-handle dragging. Width proportions also counted the fixed Bar twice after pointer release.
- Native resize now uses its temporary pixel widths without animation; pointer release refreshes Bar-adjusted proportions before restoring folding animation. Listeners and pending frame are removed on plugin disposal.
- TypeScript, production build, six layout tests passed; ESLint zero errors and two pre-existing warnings.
- Obsidian 1.13.7 isolated Sandbox: leftward 200px drag changed 638px to 438px during drag and stayed 438px after release. Rightward 150px drag changed 438px to 588px and stayed 588px after release.
- Collapse still reached 38px with 13 sampled intermediate widths. Re-expansion restored 588px / 988px. Icons and rotated titles remained visible. No captured interaction page errors.
- Normal process quit and relaunch loaded custom.4 and retained dimensions and exact 588px / 988px widths.
- Final main.js, styles.css and manifest.json matched the Sandbox-installed bytes. Evidence, hashes, backups and screenshots: C:/Users/tlatn/Documents/Codex/FoldingEvidence-20260921/custom4.
- Sandbox remains open with both bundles expanded for drag review.

## Delivery scope

## 0.17.7-custom.5 shared space allocation (2026-09-21)

- Reproduced on custom.4 with four open groups and saved dimensions 80/1/9/10: widths 1242/38/140.25/155.77px. The second group was open but had no content area.
- Same layout on custom.5: 796/260/260/260px. Allocation reserves every 38px Bar, lifts small open groups to a 260px target, and shares equally when that target cannot fit. Remaining width follows saved proportions without rewriting preferences.
- Four groups: eight fold/unfold actions passed with all bars visible and appropriate open widths. A 706px available workspace distributed four open groups at 176.5px each.
- Added a fifth group; initial widths 315.2px each. A 40px native drag produced 355.22/275.17/315.2/315.2/315.2px. Folding and reopening preserved those widths. Every sampled animation frame kept all five bars at 38px and inside the workspace.
- Normal quit/relaunch of Obsidian 1.13.7 preserved the five widths exactly and loaded custom.5. Icons and rotated titles compared visually; no captured page errors in the interaction pass.
- Ten layout/allocation tests, TypeScript and production build passed. ESLint: zero errors, two existing warnings.
- Built/installed files matched byte-for-byte. Evidence, backups, screenshots and SHA-256 records: C:/Users/tlatn/Documents/Codex/FoldingEvidence-20260921/custom5. Sandbox left open with five groups for review.

## Delivery boundary

Release asset re-download and BRAT installation/update checks are intentionally omitted at the user's request. User installation verification is separate from the local Sandbox results above.

## 0.17.7-custom.6 — edge toggle, focus restore and retained empty groups (2026-09-22)

- Dedicated right sidebar toggle: native CDP mouse clicks opened and closed the sidebar while the rightmost bundle remained collapsed. The toggle returned to the same boundary position. A caption-button overlap was found and corrected by moving the toggle below the header controls; hit-testing and screenshots verified it unobstructed.
- Ctrl-click C left only C expanded; repeating restored the prior open/collapsed layout and widths within 1px. Ctrl-click B → C → C restored the same original layout. Nested shared bundles also passed focus/restore.
- Closing D's final file via its native tab close button retained D's ID, name, order and native empty view. Closing the empty tab again retained D. Nested last-tab close retained its real subgroup.
- Bar context menu `그룹 닫기` removed only the chosen bundle. Closing the final named group produced Obsidian's fresh default empty group. An eager fallback call caused `No tab group found`; removing the redundant creation call fixed it. Final UI and edge-case passes captured no errors.
- Mode-off removed the added dock, bars and host styling and restored the native sidebar toggle. The sole remaining bundle cannot collapse.
- Normal process shutdown and relaunch produced a new CDP target on port 19371, loaded custom.6, and exactly preserved mode, group IDs/names/order, pixel widths, fold states and empty D. After restart, the edge toggle opened the sidebar with D still collapsed.
- Source and installed SHA-256 matched: main.js `872E6ED380A7CD27C63D5DC5EFD956F91B14D8D2B9B0C9C1EC73F93E4E6E3514`; styles.css `6639A0CED4B29936C30CD35DE3F82E776E0EE685FFB8B6EDFA9BC4DD5BFD4E89`; manifest.json `1FAA6C20770DE380391DE7DBD4CD33FDC89B410DC42D196A845BA0D988D08FEB`.
- Ten existing tests, TypeScript, production build and focused ESLint passed. The two existing full-project warnings are unrelated to this change.
- Evidence: `custom6-checks.json`, `custom6-edge-checks.json`, `custom6-before-restart.json`, `custom6-after-restart.json`, and associated screenshots in `C:/Users/tlatn/Documents/Codex/FoldingEvidence-20260921/`. Original workspace/data backups retained in `custom6-before/`.
- Release asset re-download and BRAT reinstall/update verification remain intentionally excluded by the existing delivery boundary.

## 0.17.7-custom.7 — stop animation resize feedback (2026-09-22)

- Diagnosis traced the cycle: folding apply requests workspace resize → NavigationContainer refreshes sidebar toggles → ViewState updates position labels → folding's broad store subscription schedules refresh → apply requests resize again.
- The fix limits the store subscription to group titles/hidden groups, requests resize only after geometry changes, skips unchanged Bar/weight writes and avoids repeated UI cleanup/resize when the mode is already off.
- Compared the installed custom.6 and final custom.7 on the same visible Sandbox, original layout and six native C-bar clicks (three open/close pairs), collecting frame timing and CDP renderer metrics over 650ms per click. A minimized-window trial was discarded because animation frames were not produced.
- Idle folding refreshes over 1.2s: custom.6 = 14, custom.7 = 0. Mean renderer TaskDuration per sample: approximately 443ms → 302ms (32% lower); ScriptDuration approximately 132ms → 73ms. These are local Sandbox measurements, not a universal FPS guarantee.
- Native pointer UI checks passed: normal fold/unfold, Ctrl-only focus and exact prior width/fold restoration, sidebar toggle, native rename dialog and restored title, actual divider width change and persistence after release. Reduced-motion expansion/collapse and mode-off cleanup also passed. No captured runtime errors in the main UI pass.
- Native resize was checked with adjacent expanded columns and sufficient window width; the initial crowded/adjacent-collapsed trial did not move the divider and was not counted as a successful resize test.
- Normal Sandbox process close/relaunch yielded a new target, loaded custom.7, and exactly preserved IDs, names, fold states, pixel widths and empty D. Post-restart idle sampling: zero refreshes in 1.5s. Final screenshot inspected; fixed toggle and Bars remain visible. Sandbox is left open.
- TypeScript, production build, ten layout tests and focused ESLint passed. Built and installed SHA-256 matched: main.js `142DC84EC64AB71A1E91D26205A17785A23F0217EFFC51ED5F1529CC02264009`; styles.css `6639A0CED4B29936C30CD35DE3F82E776E0EE685FFB8B6EDFA9BC4DD5BFD4E89`; manifest.json `AF71404103EF6325701760B8A3931842086876E15BA1B54AFC1A5029DA7548A1`.
- Evidence in `C:/Users/tlatn/Documents/Codex/FoldingEvidence-20260921/`: custom7-performance-0.17.7-custom.6.json, custom7-performance-0.17.7-custom.7.json, custom7-checks.json, custom7-extra-checks.json, custom7-before-restart.json, custom7-after-restart.json and screenshots. Pre-test workspace/data backup retained in custom7-before/.
- Existing release-asset re-download and BRAT verification exclusions remain in effect.

## 0.17.7-custom.8 — choose a group from a shared Bar (2026-09-22)

- Native pointer interaction verified the shared Bar's `그룹 닫기` submenu. Two groups sharing the default name displayed `1. Grouped tabs — C2` and `2. Grouped tabs — C1`, followed by a separated `전체 그룹` row. Screenshot compared with the requested native submenu style.
- Choosing the upper group closed both of its tabs and retained the lower group's original leaf ID plus the outside A group. Choosing the lower group retained both upper tabs. `전체 그룹` removed only the shared bundle. The remaining single group's menu retained its direct close behavior.
- A detached active leaf initially caused an error during immediate refresh after closing its group; the active-group lookup now tolerates its null parent. The complete pointer interaction suite then passed without captured runtime errors.
- All five original Markdown files remained present. Tests changed only the isolated Sandbox layout; workspace/data backups retained in custom8-before/.
- Normal process shutdown/relaunch loaded custom.8 and exactly retained selected-group removal, remaining group/leaf identities and file states. Idle folding refreshes: zero in 1.2s after restart. Sandbox remains open with outside A and lower C1 for review.
- TypeScript, production build, ten existing layout tests and focused ESLint passed. Built/installed SHA-256 matched: main.js `FA1AE2FD2A4BD85082DCCD5226FFD2B9C256632420FEA166A4D57FC7A24274D9`; styles.css `6639A0CED4B29936C30CD35DE3F82E776E0EE685FFB8B6EDFA9BC4DD5BFD4E89`; manifest.json `ACCC3BFB89A1CCBE82443531818755F5022371625FF34425ABB43055D1D51673`.
- Evidence: custom8-checks.json, custom8-submenu.png, custom8-before-restart.json, custom8-after-restart.json and custom8-after-restart.png in `C:/Users/tlatn/Documents/Codex/FoldingEvidence-20260921/`.
- Release asset re-download and BRAT reinstall/update verification remain excluded by the existing delivery boundary.
