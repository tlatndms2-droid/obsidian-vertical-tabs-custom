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
