# Vertical Tabs Custom — current handoff

Updated: 2026-09-21 (Asia/Seoul)

## 다른 PC에서 이어받기 — 먼저 읽기

이 프로젝트는 기존 Obsidian Vertical Tabs를 확장한 **Vertical Tabs Custom**입니다. 실제 Tab Group 구조를 유지하면서, 좌우 영역을 세로바로 접고 펼치는 기능을 개발했습니다.

- 저장소: https://github.com/tlatndms2-droid/obsidian-vertical-tabs-custom
- 작업 브랜치: `main`. 인수인계 직전 코드 기준: `10056ec6d6114c03638d7d618eb7b24e0ee17228`.
- 현재 버전: `0.17.7-custom.5`. 공개 Release와 `main.js`, `manifest.json`, `styles.css` 자산 등록을 2026-09-21 GitHub API로 확인했습니다. 자산 재다운로드는 하지 않았습니다.
- 새 PC에서는 [NEW_PC_START.md](NEW_PC_START.md)를 읽습니다. 아래의 이전 PC 절대경로는 참고 기록이며 새 PC에서 그대로 사용하지 않습니다.
- 현재 코드와 이 문서의 최신 동작 설명이 기획 ZIP보다 우선합니다. ZIP의 ‘아이콘 없음’, 이전 세로 글자 배치는 custom.3 이후 변경되었습니다. ZIP의 검증 보고서는 **기획 검토**이며 실제 앱 검증 결과는 [FOLDING_VALIDATION.md](FOLDING_VALIDATION.md)입니다.

### 그동안 완료된 진행

| 버전 | 사용자에게 보이는 결과 | 코드 커밋 |
|---|---|---|
| custom.1 | 기본 탭 목록 메뉴에서 그룹 숨기기/표시 | `20daf53` |
| custom.2 | 좌우 영역 접기/펼치기, 공유 세로바, 이름 변경, 이동과 상태 복원 | `16b72ab` |
| custom.3 | 38px 세로바, 16px 아이콘, 회전 제목, 접기/펼치기 애니메이션 | `a5336a4` |
| custom.4 | 그룹 사이 경계를 드래그하면 선택한 너비 유지 | `526f8f0` |
| custom.5 | 여러 그룹을 펼칠 때 일부 내용 공간이 사라지지 않도록 너비 재분배 | `10056ec` |

기존 검증 기록상 custom.5는 테스트 10개, TypeScript, production 빌드, 격리 Sandbox 동작 및 재시작 확인을 통과했습니다. ESLint는 오류 없이 기존 경고 2개가 남았습니다. 이번 인수인계에서는 코드를 바꾸거나 이 검증을 다시 실행하지 않았습니다.

### 현재 남은 진행과 중단 지점

| 항목 | 상태 / 다음 행동 |
|---|---|
| 새 PC 작업 환경 | 새 PC에서 저장소 복제와 의존성 설치 필요. 이 PC에서는 새 PC 실행 여부를 확인할 수 없음 |
| 사용자 실제 사용 확인 | 인수인계 시점 자료에서 custom.5의 최종 사용자 확인은 확인되지 않음. 아래 확인 항목으로 피드백 수집 |
| 추가 개발 | 별도로 확정된 다음 기능이나 미해결 수정 목록은 현재 자료에 없음. 이전 기획을 미구현으로 오해해 처음부터 다시 구현하지 않기 |
| Release 재다운로드 / BRAT 검증 | 사용자의 명시적 요청으로 생략. 미완료 개발 항목으로 간주해 자동 실행하지 않기 |
| 다음 수정 | 사용자가 문제 또는 원하는 변경을 정하면 그 범위에서 이어가기 |

사용자 확인 항목(이번 인수인계 작업의 새 검증 결과가 아님):

- [ ] 탭 그룹의 `∨` 메뉴에서 Folding Tab Group Mode를 켜면 왼쪽 세로바·아이콘·회전 제목이 보이는가?
- [ ] 여러 세로바를 눌러 접고 펼쳐도 열린 그룹의 내용과 모든 세로바가 보이는가?
- [ ] 그룹 사이 경계를 드래그한 뒤 마우스를 놓아도 너비가 유지되는가?
- [ ] Obsidian을 정상 종료하고 다시 열면 필요한 모드·접힘·너비 상태가 유지되는가?

### 함께 전달되는 자료와 제외된 자료

- 소스, 스타일, 테스트, 빌드 설정, `package-lock.json`, 버전 파일은 저장소에 포함됩니다.
- [기획 원본 ZIP](Folding_Tab_Group_Planning_Pack.zip)은 수정하지 않고 보관합니다.
- [최신 검증 자료](handoff-assets/custom5/README.md)에 이전 Sandbox의 재시작 화면, 전후 측정값, 빌드 해시를 보관합니다.
- `node_modules`, `dist`, 개인 Vault, Obsidian 프로필, 인증정보, Codex 전역 설정·개인 스킬·대화 기록은 포함하지 않습니다. 필요한 도구와 경로는 새 PC에서 준비합니다.
- 전체 Sandbox와 과거 모든 검증 파일은 이전 PC에 남아 있습니다. 현재 앱 창과 세션이 그대로 이동하는 것은 아닙니다.

## Current implementation

- Version: 0.17.7-custom.5; plugin ID: vertical-tabs-custom.
- Adds desktop-only Folding Tab Group Mode to the existing native tab-list menu.
- Existing native group Hide/Show implementation from custom.1 is retained.
- Earlier statements that the custom implementation has not started are obsolete; history is available in Git.
- Source input: Folding_Tab_Group_Planning_Pack.zip (original user file; included for cross-PC handoff).

## User-approved behavior

- One folding bundle per outer side-by-side column; internal rows/columns keep their real Tab Groups.
- Rows-only workspace shares one Bar and cannot collapse its sole bundle.
- 38px left Bar, 16px overlapping-tab icon and rotated title near the top; icon/title sit below the header controls to avoid Windows caption buttons. Click toggles, right-click renames a real group, drag reorders columns within the same Window.
- Native split-handle dragging takes priority over folding widths and disables animation during resize. Stored dimensions include the 38px Bar so releasing the pointer preserves the selected width.
- Collapse/expand uses a 240ms eased width transition; contents hide after collapse finishes. Reduced-motion preferences disable transitions.
- Opening groups redistributes available content width: target 260px per open bundle including its 38px Bar, proportional surplus, equal shares when crowded. Comfortable saved dimensions are retained; root-width changes recalculate allocation.
- Last expanded bundle cannot collapse. Other bundles do not automatically collapse.
- Selecting an internal tab expands its bundle; Bar expansion restores its last visible active tab.
- Existing Hide remains independent. Bar expansion does not unhide groups; explicitly activating a hidden tab shows that group.
- Group names share existing Vertical Tabs storage. Shared names follow screen order.
- Mode is shared across this Vault's Windows. Normal application shutdown preserves folding; plugin disable/manual reload clears folding state.
- Mobile Folding, cross-window bundle dragging and top/bottom bundle dropping are out of scope.

## Code and validation

- FoldingTabGroups service owns lifecycle, native menu integration, Bar interactions and local persistence.
- FoldingLayout is the pure grouping rule, covered by ten Node tests.
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
- Delivery tag: 0.17.7-custom.5.
- User explicitly requested stopping after GitHub Release creation. Do not re-download Release assets or run BRAT installation/update verification unless newly requested.
