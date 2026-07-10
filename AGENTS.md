# AGENTS.md

## Repository Boundary

- 이 저장소는 Minecraft Java Edition용 Fabric 1.21.1 샘플과 Codex agent plugin `plugins/minecraft-dev`를 함께 보관한다.
- `plugins/minecraft-dev`는 개발 도구다. Minecraft 런타임에 설치하는 mod JAR 또는 server plugin JAR로 취급하지 않는다.
- 현재 Fabric 샘플의 `src/`, manifest와 Gradle 설정은 실제 호환성 기준이다. 다른 생태계 지원을 증명하기 위해 이 코드를 Forge, NeoForge, Paper 또는 Velocity 코드와 섞지 않는다.
- `.cursor/`, `.gradle/`, `build/`와 사용자 로컬 상태를 구현 근거로 삼거나 수정하지 않는다.

## Detect First

1. 편집 전에 저장소 루트와 module 경계를 찾는다.
2. `settings.gradle*`, `build.gradle*`, `gradle.properties`, `pom.xml`, project wrapper, manifest와 API 좌표를 읽는다.
3. loader/platform, Minecraft 또는 API 버전, JDK, mappings, source set과 module을 확인된 근거로 기록한다.
4. 여러 생태계 신호가 있으면 하나를 추측하지 말고 후보, 파일 경로와 신뢰도를 보고한다.
5. 선택된 생태계와 버전에 맞는 공식 문서를 확인한 뒤 구현한다. Context7은 탐색 보조 수단이지 최종 근거가 아니다.

## Preserve the Project Contract

- 사용자가 별도 migration을 요청하지 않으면 기존 Minecraft/API 버전, loader, mappings, JDK target, dependency와 project wrapper를 유지한다.
- 이 저장소에서는 Minecraft `1.21.1`, Java `21`, Mojang mappings, Fabric Loader `0.19.2`, Loom `1.16-SNAPSHOT`, Fabric API `0.116.12+1.21.1`을 보존한다.
- 시스템 `gradle` 또는 `mvn`보다 저장소의 `./gradlew`, `gradlew.bat`, `./mvnw` 같은 project wrapper를 우선한다.
- Fabric의 common/client source set, Forge 계열의 loader lifecycle, server plugin과 proxy plugin의 API 경계를 섞지 않는다.
- manifest의 ID, Java package, entrypoint, dependency와 build 좌표가 서로 일치하는지 확인한다.

## Ecosystem Safety

- Fabric: Fabric이라고 Yarn mappings를 가정하지 않는다. `fabric.mod.json`, Loom 설정과 실제 mappings 선언을 함께 읽는다.
- Quilt: 기존 Quilt Loader 프로젝트는 감지하고 보존한다. Minecraft 26.1 이후에 중단된 Quilt Mappings, QSL, QKL 또는 Quilted Fabric API를 신규 기본값으로 추가하지 않는다. 대상 버전의 공식 유지 상태를 먼저 확인한다.
- Forge와 NeoForge: `mods.toml` 파일명만으로 플랫폼을 단정하지 않는다. Gradle plugin과 Maven 좌표를 함께 확인하고 두 API를 혼용하지 않는다.
- Bukkit/Paper: `plugin.yml` 기반 Bukkit 호환 plugin과 `paper-plugin.yml` 기반 Paper plugin을 같은 배포 대상으로 가정하지 않는다. NMS 또는 mappings를 쓰면 해당 버전의 공식 paperweight 계약을 확인한다.
- Folia: `folia-supported: true`를 자동 추가하지 않는다. region, entity, global, async scheduler와 공유 상태 안전성이 테스트로 증명된 경우에만 지원을 선언한다.
- Velocity: API dependency, annotation processor와 `@Plugin`을 함께 확인한다. 생성된 `velocity-plugin.json`이 소스 트리에 없을 수 있다.
- BungeeCord/Waterfall: Bungee 호환 manifest와 API 좌표를 확인한다. Waterfall을 신규 기본 플랫폼으로 자동 선택하거나 Velocity로 자동 migration하지 말고 현재 upstream 상태와 요청 범위를 먼저 확인한다.
- Sponge와 cross-loader: API 세대와 loader별 module을 보존한다. 공통 모듈에 client/server 또는 특정 loader 전용 코드를 유출하지 않는다.

## Side-Effect Boundaries

- EULA를 자동 수락하거나 `eula.txt`를 생성·수정하지 않는다.
- 요청 없이 Minecraft client, dedicated server, proxy 또는 production server를 시작하지 않는다.
- 감지 과정에서 Minecraft, server, mod 또는 plugin JAR를 임의로 다운로드하거나 실행하지 않는다.
- version upgrade, mappings 변경, loader migration, cross-loader 변환, 난독화 해제, 배포를 별도 승인 없이 수행하지 않는다.
- 실제 런타임 검증이 필요하면 격리된 로컬 run directory, 포트, 메모리와 종료 조건을 먼저 정의한다.

## Public Repository Hygiene

- token, API key, credential, session, cookie, private URL, player 개인정보 또는 secret 값을 파일·로그·최종 응답에 남기지 않는다.
- GitHub MCP 인증은 `GITHUB_PAT_TOKEN` 환경 변수만 사용한다. 값을 출력하거나 repository 파일에 저장하지 않는다.
- `.env`, world data, player data, logs, crash reports, server cache, EULA 동의 파일과 runtime configuration을 커밋하지 않는다.
- Mojang/Minecraft game JAR, assets, mappings cache 또는 decompiled source를 복사해 커밋하지 않는다. 공식 build tool이 dependency와 mappings를 해소하게 한다.
- 생성된 JAR와 sources JAR는 검증 산출물이다. 명시적인 release 작업이 아니면 커밋하지 않는다.
- `.agents/`와 `plugins/minecraft-dev/`의 공개 설정에는 credential 값이나 사용자 로컬 절대 경로를 넣지 않는다.

## Tests and Verification

- 변경된 동작을 가장 가까운 regression test로 먼저 고정한다. 새 생태계 감지는 실제 dependency를 추가하지 말고 격리된 fixture로 검증한다.
- Agent tooling 변경은 `node --test tests/*.test.mjs`로 검증한다.
- Java 변경은 대상 module의 focused test 후 repository wrapper로 `./gradlew check`와 `./gradlew build`를 실행한다. Maven 프로젝트에서는 기존 wrapper와 task를 따른다.
- gameplay, mixin, scheduler 또는 lifecycle 동작은 unit test만으로 충분하다고 가정하지 않는다. 필요한 경우 GameTest 또는 명시적으로 승인된 로컬 smoke test를 추가한다.
- 자동 검증에서 `runClient`, server launch 또는 production deployment를 실행하지 않는다.
- 완료를 주장하기 전에 명령의 최신 exit code와 실패 개수를 확인하고, 실행할 수 없는 검증은 이유와 남은 위험을 보고한다.
- 변경 후 `git diff --check`와 `git status --short`로 의도한 파일만 수정됐는지 확인한다.
