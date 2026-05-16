# Hello World Fabric Mod — 프로젝트 파일 트리

> Minecraft **1.21.1** · **Fabric** · 좌클릭 시 채팅에 `hello world` 출력

---

## 1. 전체 트리 (소스·설정 중심)

```
minecraft_test/
│
├── build.gradle                 # Gradle 빌드: Loom, 의존성, main/client 분리, JAR 생성
├── settings.gradle              # 프로젝트 이름·플러그인 저장소(Fabric Maven)
├── gradle.properties            # MC/Loader/API/Loom/모드 버전 상수
├── gradlew                      # Unix/macOS용 Gradle Wrapper 실행 스크립트
├── gradlew.bat                  # Windows용 Gradle Wrapper 실행 스크립트
├── LICENSE                      # CC0 — 최종 JAR에 포함되는 라이선스
├── .gitignore                   # Git 제외 목록 (build/, .gradle/ 등)
│
├── gradle/
│   └── wrapper/
│       ├── gradle-wrapper.jar           # Wrapper가 내려받을 Gradle 실행기
│       └── gradle-wrapper.properties    # Gradle 배포 URL (예: 9.4.1)
│
├── docs/
│   └── PROJECT_TREE.md          # ← 이 문서 (구조·역할 설명)
│
├── src/
│   ├── main/                    # 공통 소스 (서버·클라이언트 모두에서 로드 가능한 부분)
│   │   ├── java/
│   │   │   └── com/example/helloworld/
│   │   │       └── HelloWorldMod.java       # ModInitializer — 공통 진입점
│   │   └── resources/
│   │       └── fabric.mod.json              # Fabric 모드 메타데이터 (id, entrypoints, mixins)
│   │
│   └── client/                  # 클라이언트 전용 소스 (전용 서버 JAR에는 넣지 않음)
│       ├── java/
│       │   └── com/example/helloworld/client/
│       │       ├── HelloWorldClient.java              # ClientModInitializer — 클라 진입점
│       │       └── mixin/
│       │           └── MinecraftClientMixin.java      # 좌클릭 → 채팅 (핵심 로직)
│       └── resources/
│           └── helloworld.client.mixins.json          # 클라이언트 Mixin 등록 목록
│
├── build/                       # [생성물] ./gradlew build 결과 — Git 제외
│   ├── classes/                 # 컴파일된 .class
│   ├── resources/               # 처리된 리소스 (fabric.mod.json version 치환 등)
│   └── libs/
│       ├── helloworld-1.0.0.jar           # 배포·mods 폴더에 넣을 모드 JAR
│       └── helloworld-1.0.0-sources.jar   # 소스 JAR (디버깅·배포용)
│
├── .gradle/                     # [캐시] Gradle/Loom 캐시 — Git 제외
└── .cursor/                     # [IDE] Cursor 계획·훅 — 모드 동작과 무관
```

---

## 2. 단계별로 “어디서” 동작하는가

### 2.1 빌드 단계 (`./gradlew build`)

| 순서 | 관여 파일                            | 동작                                                             |
| ---- | ------------------------------------ | ---------------------------------------------------------------- |
| 1    | `gradle/wrapper/*`, `gradlew`        | 고정된 Gradle 버전으로 빌드 실행                                 |
| 2    | `gradle.properties`                  | `minecraft_version`, `loader_version` 등을 `build.gradle`에 전달 |
| 3    | `build.gradle`                       | Minecraft JAR·매핑·Fabric API 다운로드, `main`/`client` 컴파일   |
| 4    | `src/main/resources/fabric.mod.json` | `processResources`가 `${version}` → `1.0.0` 등으로 치환          |
| 5    | `build.gradle` (`loom`)              | Mixin 적용·리매핑 후 `build/libs/*.jar` 생성                     |

### 2.2 게임 로드 단계 (클라이언트 실행)

| 순서 | 관여 파일                         | 동작                                                           |
| ---- | --------------------------------- | -------------------------------------------------------------- |
| 1    | `build/libs/helloworld-1.0.0.jar` | `mods` 폴더(또는 `runClient`)로 Fabric Loader가 로드           |
| 2    | `fabric.mod.json`                 | mod id, 의존성, **entrypoints**, **mixins** 경로 읽기          |
| 3    | `HelloWorldMod.java`              | `entrypoints.main` → `onInitialize()` (로그)                   |
| 4    | `HelloWorldClient.java`           | `entrypoints.client` → `onInitializeClient()` (현재 비어 있음) |
| 5    | `helloworld.client.mixins.json`   | `MinecraftClientMixin`을 `Minecraft` 클래스에 바이트코드 합침  |

### 2.3 플레이 중 (좌클릭)

| 순서 | 관여 파일                   | 동작                                                             |
| ---- | --------------------------- | ---------------------------------------------------------------- |
| 1    | (바닐라) `Minecraft`        | 좌클릭 → `startAttack()` 호출                                    |
| 2    | `MinecraftClientMixin.java` | `@Inject(HEAD)` — 메서드 시작 직전 우리 코드 실행                |
| 3    | 동일 Mixin                  | `player.displayClientMessage("hello world")` → **로컬 채팅 HUD** |
| 4    | (바닐라) `startAttack` 본문 | 공격·스윙 등 원래 게임 로직 계속                                 |

---

## 3. 폴더별 역할

### 루트 (`minecraft_test/`)

| 경로                      | 필요 이유                                                         |
| ------------------------- | ----------------------------------------------------------------- |
| `build.gradle`            | Fabric Loom으로 모드를 **컴파일·리매핑·JAR 패키징**하는 중심 설정 |
| `settings.gradle`         | Gradle **프로젝트 이름**과 Fabric Maven **플러그인 위치**         |
| `gradle.properties`       | 버전 숫자를 한곳에 모아 **재현 가능한 빌드**                      |
| `gradlew` / `gradlew.bat` | 팀원 PC에 Gradle을 따로 설치하지 않아도 **동일 버전으로 빌드**    |
| `LICENSE`                 | 배포 시 **저작권·사용 조건** 명시 (JAR에 포함)                    |
| `.gitignore`              | `build/`, `.gradle/` 등 **자동 생성물을 커밋하지 않기** 위해      |

### `gradle/wrapper/`

| 파일                        | 필요 이유                               |
| --------------------------- | --------------------------------------- |
| `gradle-wrapper.properties` | 사용할 **Gradle 버전 URL** 지정         |
| `gradle-wrapper.jar`        | Wrapper가 위 URL에서 Gradle을 받아 실행 |

### `src/main/` — 공통(environment: 서버 + 클라이언트)

Fabric Loom의 `splitEnvironmentSourceSets()`로 **서버에도 올라갈 수 있는** 코드·리소스만 둡니다.

```
src/main/
├── java/.../HelloWorldMod.java     # Fabric ModInitializer — 모드 로드 시 1회
└── resources/fabric.mod.json       # Loader가 읽는 모드 “설명서”
```

| 파일                 | 구조·역할                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------ |
| `HelloWorldMod.java` | `MOD_ID`, `LOGGER`, `onInitialize()` — **공통 초기화** (현재는 로드 로그만)                |
| `fabric.mod.json`    | `id`, `version`, `entrypoints`, `mixins`, `depends` — **어떤 클래스를 언제 로드할지** 정의 |

### `src/client/` — 클라이언트 전용

**물리 클라이언트에서만** 로드됩니다. 전용 서버에는 이 소스가 포함되지 않습니다.

```
src/client/
├── java/.../HelloWorldClient.java           # ClientModInitializer
├── java/.../mixin/MinecraftClientMixin.java # @Mixin(Minecraft) — 실제 기능
└── resources/helloworld.client.mixins.json  # Mixin 클래스 목록
```

| 파일                            | 구조·역할                                                                   |
| ------------------------------- | --------------------------------------------------------------------------- |
| `HelloWorldClient.java`         | 클라이언트 시작 시 1회 호출되는 **확장 지점** (키바인딩·HUD 등을 넣을 자리) |
| `MinecraftClientMixin.java`     | `startAttack` **HEAD**에 주입 → `hello world` 채팅 출력                     |
| `helloworld.client.mixins.json` | `package` + `client: ["MinecraftClientMixin"]` — Mixin 엔진 설정            |

### `build/` — 빌드 산출물 (직접 편집하지 않음)

| 경로                                   | 생성 시점            | 용도                                       |
| -------------------------------------- | -------------------- | ------------------------------------------ |
| `build/libs/helloworld-1.0.0.jar`      | `assemble` / `build` | 게임 `mods` 폴더에 넣는 **최종 모드**      |
| `build/resources/main/fabric.mod.json` | `processResources`   | `${version}`이 치환된 **실제 로드용** 메타 |
| `build/classes/`                       | `compileJava`        | 중간 `.class`                              |

### `docs/`

| 파일              | 용도                                           |
| ----------------- | ---------------------------------------------- |
| `PROJECT_TREE.md` | 프로젝트 구조·흐름 **문서** (런타임 코드 아님) |

### Git·IDE에서 보이지만 모드 로직과 무관

| 경로                      | 설명                                                                  |
| ------------------------- | --------------------------------------------------------------------- |
| `.gradle/`, `loom-cache/` | Loom이 Minecraft·Fabric API를 **캐시** — 삭제해도 다음 빌드 시 재생성 |
| `.cursor/`                | Cursor 에이전트 계획 등 — **모드 실행과 무관**                        |
| `.git/`                   | 버전 관리                                                             |

---

## 4. 파일 간 연결 관계

```
gradle.properties ──버전──► build.gradle ──컴파일──► build/libs/*.jar
                                    │
                                    ├──► src/main  ──► HelloWorldMod
                                    │         └──► fabric.mod.json
                                    │
                                    └──► src/client ──► HelloWorldClient
                                              ├──► MinecraftClientMixin
                                              └──► helloworld.client.mixins.json

fabric.mod.json ──entrypoints.main──► HelloWorldMod.onInitialize()
              ──entrypoints.client► HelloWorldClient.onInitializeClient()
              ──mixins────────────► helloworld.client.mixins.json
                                              └──► MinecraftClientMixin → Minecraft.startAttack
```

---

## 5. “이 기능은 어느 파일?” 빠른 참조

| 하고 싶은 일                   | 수정할 파일                                                     |
| ------------------------------ | --------------------------------------------------------------- |
| 채팅 문구 변경                 | `src/client/.../MinecraftClientMixin.java`                      |
| 좌클릭 대신 다른 입력          | 동일 Mixin의 `method = "startAttack"` 또는 다른 Mixin           |
| 모드 id / 이름 / 의존 버전     | `src/main/resources/fabric.mod.json`, `HelloWorldMod.MOD_ID`    |
| MC·Fabric 버전 변경            | `gradle.properties`, `fabric.mod.json`의 `depends`              |
| 클라이언트 시작 시 초기화 추가 | `HelloWorldClient.java`                                         |
| 서버에서도 돌아가는 로직 추가  | `src/main/java/.../HelloWorldMod.java` (또는 main 쪽 새 클래스) |
| 빌드·실행                      | `./gradlew build`, `./gradlew runClient`                        |

---

## 6. 소스 vs 생성물 요약

| 구분          | 경로                                                              | Git에 넣나?           |
| ------------- | ----------------------------------------------------------------- | --------------------- |
| **직접 작성** | `src/`, `build.gradle`, `gradle.properties`, `fabric.mod.json` 등 | 예                    |
| **빌드 결과** | `build/`                                                          | 아니오 (`.gitignore`) |
| **캐시**      | `.gradle/`                                                        | 아니오                |
| **문서**      | `docs/PROJECT_TREE.md`                                            | 예 (선택)             |

이 트리에서 **플레이어가 체감하는 동작**은 거의 전부 `MinecraftClientMixin.java` 한 파일에서 일어납니다. 나머지는 **로드·빌드·확장을 위한 뼈대**입니다.
