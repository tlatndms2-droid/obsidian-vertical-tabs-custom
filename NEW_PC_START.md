# 다른 PC에서 작업 이어가기

기준: 2026-09-21 / Vertical Tabs Custom `0.17.7-custom.5`.

## 1. 프로젝트 내려받기

1. 새 PC에서 GitHub Desktop을 열고 저장소에 접근 가능한 GitHub 계정으로 로그인합니다.
2. `File → Clone repository → URL`에 아래 주소를 넣습니다.
   `https://github.com/tlatndms2-droid/obsidian-vertical-tabs-custom`
3. 새 PC의 작업 폴더를 선택하고 `Clone`을 누릅니다. 기존 다른 프로젝트 폴더를 덮어쓰지 않습니다.
4. 브랜치가 `main`인지 확인하고 `Fetch origin` 후 업데이트가 있으면 `Pull origin`을 누릅니다.
5. 내려받은 폴더에서 `HANDOFF.md`를 먼저 읽습니다.

두 PC를 번갈아 사용할 때는 작업 시작 전에 최신 내용을 내려받고, 작업 종료 후 변경을 커밋하고 `Push origin`으로 올립니다. 두 PC에서 같은 파일을 동시에 수정하면 합치는 작업이 필요할 수 있습니다.

## 2. 새 작업에서 전달할 내용

프로젝트 폴더를 작업 대상으로 열고 다음 내용을 전달합니다. 실제 수정 요청은 마지막에 따로 덧붙입니다.

```text
이 저장소의 HANDOFF.md, NEW_PC_START.md, FOLDING_VALIDATION.md를 읽고
현재 버전과 작업 상태를 확인해줘.
기준은 main의 Vertical Tabs Custom 0.17.7-custom.5이며 이미 구현과 Release가 되어 있어.
기획 ZIP에는 오래된 화면 설명이 있으므로 최신 HANDOFF와 현재 코드를 우선해.
우선 완료된 작업, 실제 남은 작업, 이 PC에서 준비가 필요한 항목을 짧게 설명해줘.
개인 Vault를 수정하지 말고, 검증이 필요하면 이 PC의 별도 Sandbox를 사용해.
Release 재다운로드와 BRAT 검증은 이전 요청으로 생략했으므로 자동으로 실행하지 마.
추가 수정 범위는 내가 다음 메시지로 알려줄게.
```

기존 대화 기록과 이전 PC의 전역 지침·개인 스킬은 GitHub 복제로 옮겨지지 않습니다. 새 작업은 저장소 문서를 바탕으로 맥락을 이어받습니다.

## 3. 개발 환경 준비 — 작업을 맡은 도구가 수행할 부분

- Git, Node.js와 npm, Obsidian이 필요합니다. 이전 PC에서 확인한 Node는 `v24.19.0`, 최종 Sandbox Obsidian은 `1.13.7`입니다. 이는 사용 이력이며 다른 버전의 호환성을 검증했다는 뜻은 아닙니다.
- Node 설치 시 npm도 준비하고, 새 터미널에서 `node --version`, `npm --version`을 확인합니다. 현재 인수인계 실행 환경은 Node만 PATH에 있고 `npm` 명령은 없으므로 그 환경 구성을 그대로 복사하지 않습니다.
- 저장소 루트에서 `npm ci`로 `package-lock.json`에 맞는 의존성을 설치합니다. 기존 `node_modules`를 다른 PC에서 복사하지 않습니다.
- PowerShell에서 npm 스크립트 실행 정책 오류가 나면 `npm.cmd ci`를 사용합니다. 전역 실행 정책을 임의로 변경하지 않습니다.
- 개인 인증정보나 이전 PC의 `.env`는 필요 자료로 업로드하지 않습니다. 기존 production 빌드 설정에는 새 비밀키 입력이 필요하지 않습니다.

코드 수정 또는 환경 검증을 요청받았을 때 사용할 명령(저장소 루트, PowerShell):

```powershell
npm.cmd ci
node --test tests/folding-layout.test.mjs
node node_modules/typescript/bin/tsc --noEmit --skipLibCheck
node node_modules/eslint/bin/eslint.js .
node esbuild.config.mjs production
Copy-Item -LiteralPath manifest.json -Destination dist/manifest.json
```

각 명령이 성공한 뒤 다음 명령을 실행합니다. 산출물은 `dist/main.js`, `dist/styles.css`, `dist/manifest.json`입니다. 기존 npm 빌드 스크립트의 `cp`는 Windows 환경에 따라 실행되지 않을 수 있어 위처럼 나눠서 실행합니다.

이번 인수인계에서는 새 PC의 의존성 설치·빌드·실행을 수행하지 않았습니다. 위 절차의 새 PC 성공 여부는 해당 PC에서 확인해야 합니다.

## 4. 화면 검증이 필요한 경우

새 PC에서는 별도의 테스트 Vault와 Obsidian 프로필을 준비합니다. 기존 HANDOFF에 있는 `C:/Users/tlatn/...` 경로나 디버깅 포트를 그대로 가정하지 않습니다. 이전 PC의 Sandbox 등록과 실행 세션은 이전되지 않습니다.

1. 독립 Sandbox가 열린 것을 확인합니다.
2. 검증할 새 빌드의 세 파일을 Sandbox의 `.obsidian/plugins/vertical-tabs-custom/`에 설치합니다.
3. A1, A2, B1, C1, C2, D1 같은 테스트 노트로 좌우 그룹과 내부 상하 분할을 구성합니다.
4. `HANDOFF.md`의 확정 동작과 `FOLDING_VALIDATION.md`의 해당 버전 항목을 기준으로 실제 클릭·드래그·재시작을 확인합니다.
5. 최신 화면 기준은 `handoff-assets/custom5/after-restart.png`입니다. 이것은 이전 실행의 결과 이미지이며 승인된 원본 시안이라고 간주하지 않습니다.

검증에 필요한 개인 스킬이나 도구가 새 PC에 없으면 현재 사용 가능한 방법부터 확인합니다. 과거 PC의 도구가 있다고 가정하거나 이전 검증 기록만으로 새 수정을 통과 처리하지 않습니다.

## 5. 자료 위치

| 자료 | 위치 |
|---|---|
| 현재 상태·남은 일·확정 동작 | `HANDOFF.md` |
| 버전별 실제 검증 기록 | `FOLDING_VALIDATION.md` |
| 최초 기획 원본과 HTML 참고 화면 | `Folding_Tab_Group_Planning_Pack.zip` |
| 최신 검증 화면·전후 측정·파일 해시 | `handoff-assets/custom5/` |
| 코드와 스타일 | `src/` |
| 자동 테스트 | `tests/folding-layout.test.mjs` |
| 설치용 배포 파일 | [custom.5 Release](https://github.com/tlatndms2-droid/obsidian-vertical-tabs-custom/releases/tag/0.17.7-custom.5) |

기획 ZIP은 처음 설계한 기록입니다. ‘구현 착수 가능’, ‘아이콘 없음’ 같은 과거 문구를 현재 남은 작업으로 해석하지 않습니다. 전체 Sandbox, 전체 과거 증거 파일, 원본 디자인 시안은 이 전달 묶음에 포함되지 않습니다. 픽셀 단위 시안 비교가 필요한 새 작업이라면 필요한 참조를 별도로 확보합니다.
