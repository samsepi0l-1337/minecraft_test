# Minecraft Agent Tooling Design

## Goal

Package a public, repo-local Codex plugin that can safely start, extend, debug, test, and package Minecraft Java Edition mods and server/proxy plugins across the major maintained ecosystems. The plugin must provide MCP connections, progressive-disclosure guidance, specialist agents, lifecycle hooks, and installation metadata without committing credentials or silently migrating an existing project.

## Supported ecosystems

The configuration covers these project families and routes by repository evidence:

- Mods: Fabric, Quilt, Forge, NeoForge, and shared/cross-loader projects such as Architectury-style layouts.
- Server plugins: Bukkit, Spigot, Paper, Purpur, and Folia.
- Proxy plugins: Velocity, BungeeCord, and Waterfall-compatible projects.
- Hybrid/plugin platforms: Sponge.
- Build layouts: Gradle Groovy/Kotlin DSL, Maven, single-project, and multi-project repositories.

The current repository remains a Fabric 1.21.1 project. Support for other ecosystems is added to the agent package, not to the production mod's dependencies or source tree.

## Chosen approach

Use one repo-local plugin named `minecraft-dev` under `plugins/`, surfaced by `.agents/plugins/marketplace.json`. Give it one routing skill, `minecraft-java-development`, whose small main workflow detects the project before loading exactly one relevant reference file.

This is preferred over separate plugins because cross-loader and server/proxy work often spans several modules. It is preferred over a monolithic skill because Fabric, Forge-family, Paper-family, proxies, and Sponge have incompatible mappings, lifecycle APIs, manifests, schedulers, and test commands.

## Components

- MCP: connect to Context7 for documentation discovery and GitHub's official read-only remote MCP server for repository, pull request, action, and CI context. Context7 is advisory; implementation-sensitive claims are confirmed against the selected ecosystem's official documentation.
- Skill: `minecraft-java-development` detects ecosystem, Minecraft/API version, JDK target, build system, mappings, source sets/modules, and manifests before edits. It loads one of `fabric`, `quilt`, `forge`, `neoforge`, `paper`, `proxy`, `sponge`, `cross-loader`, or `testing` references only when needed.
- Agents: separate project exploration, mod implementation, plugin/proxy implementation, compatibility architecture, and independent verification.
- Hooks: inject detected project facts at session start and refresh them after relevant build/manifest edits. Hooks stay fast, fail open, dependency-free, and never accept an EULA or launch a game/server automatically.
- Marketplace/plugin metadata: make the complete package installable from a clone and discoverable in the Codex app.
- Repository guidance: add concise root `AGENTS.md` and `README.md` files so safety and install rules remain visible before plugin installation.

## Detection contract

The inspector walks upward from the working directory and records only evidence it can read:

- Fabric: `fabric.mod.json`, Fabric Loom plugin IDs, Fabric Loader/API coordinates.
- Quilt: `quilt.mod.json`, Quilt Loom/Loader/QSL coordinates.
- Forge: `META-INF/mods.toml`, ForgeGradle, `net.minecraftforge` coordinates.
- NeoForge: `META-INF/neoforge.mods.toml` or `META-INF/mods.toml`, ModDevGradle/NeoGradle, `net.neoforged` coordinates.
- Paper family: `plugin.yml` or `paper-plugin.yml`, Paper/Spigot/Bukkit/Purpur/Folia API coordinates.
- Velocity: `velocity-plugin.json` or Velocity API/annotation processor coordinates.
- Bungee/Waterfall: `bungee.yml` and proxy API coordinates.
- Sponge: `META-INF/sponge_plugins.json` and Sponge API coordinates.
- Cross-loader: multiple loader manifests, `common` plus loader-specific modules, or Architectury plugin/coordinates.

Ambiguous evidence is reported as multiple candidates. The plugin never guesses a loader, mappings namespace, Minecraft version, server scheduler model, or Java target.

## Data and control flow

1. Codex installs `minecraft-dev` from the repository marketplace.
2. The session-start hook detects build files and manifests, then emits the observed ecosystem, versions, Java target, mappings clues, and modules.
3. A Minecraft request triggers `minecraft-java-development` or a specialist agent.
4. The skill reads the matching reference, official versioned documentation, and current project configuration before planning changes.
5. Implementation stays inside the detected loader/platform boundaries and writes a regression test appropriate to that platform.
6. Verification runs the repository wrapper (`gradlew`, `mvnw`) and existing project tasks rather than inventing commands. Client/game/server launches happen only when the requested behavior requires them.
7. The post-edit hook re-runs detection only after a relevant file changes; complete manifest validation remains the responsibility of the project's real build because dependency-free hooks cannot fully parse every supported TOML/YAML dialect.

## Security and side-effect policy

- Commit no token, API key, credential helper output, world/server data, generated game files, Gradle/Maven caches, run directories, logs, crash reports, or EULA acceptance.
- Configure GitHub MCP authentication only through `GITHUB_PAT_TOKEN` and use its read-only endpoint; publish with explicit `git`/`gh` commands.
- Use HTTPS MCP endpoints and a fixed allow-list of Context7 and GitHub.
- Do not download or execute arbitrary community MCP servers, unpinned `npx` packages, or mod JARs as part of project detection.
- Keep hook logic dependency-free with Node.js built-ins and do not print stdin, environment values, or file contents that may contain secrets.
- Treat version upgrades, loader migrations, mapping changes, cross-loader conversions, EULA acceptance, and production server deployment as separate explicit tasks.

## Version policy

Always take versions from the target repository and matching official documentation. Never copy the latest template into an older project. In this repository, preserve Minecraft `1.21.1`, Java `21`, Mojang mappings, Loader `0.19.2`, Loom `1.16-SNAPSHOT`, and Fabric API `0.116.12+1.21.1` unless a separate migration is requested.

## Testing strategy

- Write a Node contract test before scaffolding; it must fail while `minecraft-dev` is absent.
- Unit-test root discovery, property parsing, ecosystem evidence detection, ambiguity handling, current Fabric 1.21.1 rendering, and post-edit relevance filtering.
- Fixture-test representative manifests for Fabric, Quilt, Forge, NeoForge, Paper, Velocity, Bungee, and Sponge without adding their build dependencies to this repository.
- Run the inspector against the real repository and confirm it identifies only Fabric 1.21.1.
- Run skill/plugin/JSON/YAML validation, secret and artifact scans, plugin installation/listing, `git diff --check`, `./gradlew check`, and `./gradlew build` before push.
- Request an independent final review of ecosystem coverage, security boundaries, and validation evidence.

## Primary reference policy

Each ecosystem reference links to its official documentation or official project repository. Context7 may locate a page but cannot be the final authority. Community-only platforms or compatibility layers are labeled as such; unsupported or abandoned projects are not presented as maintained defaults.
