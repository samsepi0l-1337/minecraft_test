# Minecraft Java Development Tooling

이 공개 저장소에는 서로 목적이 다른 두 항목이 함께 있습니다.

1. 루트의 `src/`와 Gradle 파일은 Minecraft 1.21.1용 **Fabric 샘플 모드**입니다. 현재 예제는 Java 21과 Mojang mappings를 사용하며, 클라이언트에서 좌클릭할 때 로컬 채팅에 `hello world`를 표시합니다.
2. `plugins/minecraft-dev/`는 여러 Minecraft Java 생태계에서 개발 작업을 돕는 **Codex agent plugin**입니다. Minecraft의 `mods/` 또는 서버의 `plugins/` 폴더에 넣는 JAR가 아니며, 기존 Fabric 모드의 로더나 의존성을 바꾸지 않습니다.

## 지원 범위

`minecraft-dev`는 먼저 저장소의 manifest, build 파일, project wrapper, 버전, mappings, source set과 모듈 구조를 감지한 뒤 해당 생태계의 지침만 사용합니다.

| 분류 | 감지·지원 대상 |
| --- | --- |
| 모드 로더 | Fabric, Quilt, Forge, NeoForge |
| 서버 플러그인 | Bukkit, Spigot, Paper, Purpur, Folia |
| 프록시 플러그인 | Velocity, BungeeCord, Waterfall 호환 프로젝트 |
| 하이브리드 | Sponge |
| 다중 로더 | 공통 모듈과 loader별 모듈을 둔 Architectury 스타일 프로젝트 |
| 빌드 | Gradle Groovy/Kotlin DSL, Maven, 단일·다중 프로젝트 |

감지 결과가 모호하면 하나를 추측하지 않고 후보와 근거를 함께 보고합니다. 버전 업그레이드, mappings 변경, loader 이전과 cross-loader 변환은 별도 요청 없이 수행하지 않습니다.

## MCP 용어

이 저장소에서 **MCP**는 Codex가 외부 문서와 GitHub 문맥을 읽는 데 사용하는 **Model Context Protocol**을 뜻합니다. Minecraft 역사에서 같은 약어로 불린 **Mod Coder Pack**과는 다른 도구이며, MCP 연결을 추가한다고 Minecraft mappings가 바뀌지 않습니다.

플러그인은 다음 MCP 연결을 제공합니다.

- Context7: 문서 탐색용 보조 인덱스. 구현에 민감한 내용은 선택된 생태계의 공식 문서로 다시 확인합니다.
- GitHub: 저장소, pull request와 CI 문맥을 읽는 read-only 연결입니다.

## Codex 플러그인 설치

저장소 루트에서 실행합니다.

```bash
codex plugin marketplace add "$PWD"
codex plugin add minecraft-dev@minecraft-test
```

GitHub MCP가 필요할 때만 `GITHUB_PAT_TOKEN`을 셸 환경에 설정합니다. 토큰 값은 `.env`, 문서, Git 설정 또는 커밋에 저장하지 마세요. 토큰이 없어도 로컬 프로젝트 감지와 저장소에 포함된 지침은 사용할 수 있습니다.

```bash
export GITHUB_PAT_TOKEN="<your-token>"
```

## 현재 Fabric 샘플

현재 샘플의 기준은 다음과 같습니다.

- Minecraft `1.21.1`
- Java `21`
- Fabric Loader `0.19.2`
- Fabric Loom `1.16-SNAPSHOT`
- Fabric API `0.116.12+1.21.1`
- Mojang official mappings
- 공통 `src/main`과 클라이언트 전용 `src/client` 분리

이 값은 예제의 재현 가능한 기준입니다. 최신 버전으로 자동 치환하지 마세요. 파일 구조와 실행 흐름은 [docs/PROJECT_TREE.md](docs/PROJECT_TREE.md)를 참고하세요.

## 검증

Agent plugin과 hook 계약을 검증합니다.

```bash
node --test tests/*.test.mjs
node plugins/minecraft-dev/scripts/minecraft-project-inspector.mjs SessionStart
```

현재 Fabric 샘플을 repository wrapper로 검증합니다.

```bash
./gradlew check
./gradlew build
git diff --check
```

`runClient`, 전용 서버 실행, EULA 동의, 외부 JAR 다운로드와 배포는 자동 검증에 포함하지 않습니다. 실제 게임 실행이 필요한 작업은 요청 범위와 안전한 로컬 실행 경로를 먼저 확인합니다.
