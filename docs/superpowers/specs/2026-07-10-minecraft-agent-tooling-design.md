# Minecraft Agent Tooling Design

## Goal

Package the repository's Minecraft Fabric 1.21.1 development workflow as a public, repo-local Codex plugin. The plugin must provide MCP connections, a reusable skill, specialist agents, lifecycle hooks, and installation metadata without committing credentials.

## Chosen approach

Use one repo-local plugin named `minecraft-fabric-dev` under `plugins/`, surfaced by a repository marketplace under `.agents/plugins/marketplace.json`.

This is preferred over a personal plugin because every clone receives the same versioned workflow. It is preferred over unrelated top-level config files because the plugin keeps its MCP, skill, agents, hooks, scripts, and metadata within one installable boundary.

## Components

- MCP: connect to Context7 for version-aware documentation discovery and GitHub's official remote MCP server for repository and CI context. Treat Context7 as an index, then confirm implementation-sensitive claims against Fabric's official documentation.
- Skill: `minecraft-fabric-mod` reads the repository's declared Minecraft, Loader, Loom, Fabric API, mapping, and Java versions before editing. It preserves common/client source-set boundaries and requires test/build evidence.
- Agents: provide separate planning, implementation, and verification roles. Each role reports concrete files, commands, and unresolved risks instead of assuming a Minecraft or mapping version.
- Hooks: inject the detected Fabric/Java context at session start and statically validate required project metadata at stop time. Hooks stay fast and do not launch the Minecraft client.
- Marketplace/plugin metadata: make the plugin installable from the repository and discoverable in the Codex app.
- Repository guidance: add a concise root `AGENTS.md` and `README.md` so the essential rules and install steps remain visible even before plugin installation.

## Data and control flow

1. Codex loads the repository marketplace and installs `minecraft-fabric-dev`.
2. The session-start hook walks upward from the working directory to find `gradle.properties`, `build.gradle`, and `fabric.mod.json`, then emits the detected target versions as context.
3. Minecraft/Fabric requests trigger the skill or one of the specialist agents.
4. Documentation lookup may use Context7, but source-sensitive decisions are checked against the matching version of Fabric's official docs.
5. The implementation workflow runs targeted tests, then `./gradlew check` and `./gradlew build`.
6. The stop hook rejects malformed or inconsistent Fabric metadata without running an expensive full build.

## Security and reliability

- Commit no token, API key, credential helper output, generated game files, Gradle caches, or run directories.
- Configure GitHub MCP authentication only through `GITHUB_PAT_TOKEN`.
- Use HTTPS MCP endpoints and a fixed allow-list of two servers.
- Keep hook logic dependency-free by using Node.js built-ins only.
- Validate plugin JSON, skill frontmatter, marketplace paths, hook commands, secret absence, hook behavior, Gradle checks, and the remapped JAR build before push.

## Version policy

The repository remains on Minecraft `1.21.1`, Java `21`, Mojang mappings, Loader `0.19.2`, Loom `1.16-SNAPSHOT`, and Fabric API `0.116.12+1.21.1` unless a separate migration is requested. "Latest" documentation or dependencies must never be substituted silently because Fabric documentation currently spans materially different Minecraft/JDK generations.

## Testing strategy

- Write a Node contract test before scaffolding; it must fail while the plugin is absent.
- Add unit tests for project-root discovery, Gradle property parsing, metadata inspection, and session context rendering.
- Run the hook against the real repository in session-start and stop modes.
- Run the skill validator, JSON parsing checks, plugin installation/listing checks, `git diff --check`, `./gradlew check`, and `./gradlew build`.
- Request an independent final review before committing the implementation.

## Official references

- Fabric 1.21.1 project creation: https://docs.fabricmc.net/1.21.1/develop/getting-started/creating-a-project
- Fabric 1.21.1 automated testing: https://docs.fabricmc.net/1.21.1/develop/automatic-testing
- Fabric 1.21.1 data generation: https://docs.fabricmc.net/1.21.1/develop/data-generation/setup
- Fabric Loom documentation: https://docs.fabricmc.net/develop/loom/
- GitHub MCP Server: https://github.com/github/github-mcp-server
- Context7 MCP: https://github.com/upstash/context7
