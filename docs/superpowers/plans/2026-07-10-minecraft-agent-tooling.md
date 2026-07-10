# Minecraft Agent Tooling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

## Progress checkpoint — 2026-07-10

Work intentionally stopped at the user's request. This checkpoint is not a completion claim and has not been pushed publicly.

### Completed

- Confirmed the target is the public `samsepi0l-1337/minecraft_test` repository and preserved the existing Fabric 1.21.1 sample.
- Added the `minecraft-dev` marketplace/plugin manifests, Context7 and read-only GitHub MCP configuration, five specialist agents, the `minecraft-java-development` routing skill, nine ecosystem references, lifecycle hooks, and a dependency-free project inspector.
- Covered Fabric, Quilt, Forge, NeoForge, Bukkit, Spigot, Paper, Purpur, Folia, Velocity, BungeeCord, Waterfall maintenance, Sponge, and Architectury-style cross-loader detection with temporary fixtures.
- Added root contributor/install guidance and public-repository ignore rules.
- Installed and enabled `minecraft-dev@minecraft-test` locally. `GITHUB_PAT_TOKEN` was not set, so the optional authenticated GitHub MCP connection was not exercised.

### Verification captured

- Skill quick validation: passed.
- Plugin marketplace add/install/list: passed; version `0.1.0` enabled.
- Node package and inspector suite: 31 tests passed before the final multi-module root regression; the latest focused inspector run passed all 25 tests after that regression was added.
- `./gradlew check`: passed.
- `./gradlew build`: passed; remapped JAR and Fabric metadata were inspected.
- JSON parsing, credential-pattern scan, executable syntax check, and staged `git diff --check`: passed.

### Outstanding before public delivery

1. Fix normal multi-module Maven ownership and version/JDK extraction: whitespace-formatted `<module>` entries, Maven properties such as `${paper.version}`, and `maven.compiler.source`/`target` are not fully resolved by the inspector.
2. Sanitize and length-limit every metadata value before lifecycle-hook output so adversarial properties cannot inject control characters or instruction-like context.
3. Add regression tests for both issues, then repeat the complete Node, hook, skill, plugin-install, secret, Gradle, artifact, and Git checks.
4. Complete an independent final review. The review was interrupted after reporting the two important issues above.
5. Commit the finished implementation, push `main`, and verify `HEAD == origin/main` plus GitHub visibility `PUBLIC`.

**Goal:** Add and publicly publish a repo-local Codex plugin that supports the major Minecraft Java mod, server-plugin, proxy-plugin, hybrid, and cross-loader ecosystems without changing the current Fabric mod.

**Architecture:** Keep the distributable integration in `plugins/minecraft-dev`, expose it through `.agents/plugins/marketplace.json`, and provide one progressive-disclosure skill with ecosystem-specific references. A dependency-free Node inspector powers session-start/post-edit hooks and is fixture-tested across recognized manifest families.

**Tech Stack:** Codex plugin manifests, MCP over HTTPS, Markdown skills/agents, Node.js built-ins, JSON/TOML/YAML text inspection, Gradle/Maven wrapper conventions.

## Global Constraints

- Preserve the current repository's Minecraft `1.21.1`, Java `21`, Mojang mappings, Loader `0.19.2`, Loom `1.16-SNAPSHOT`, and Fabric API `0.116.12+1.21.1`.
- Add no npm, Gradle, Maven, or Python dependency for the agent tooling.
- Store no token or API key; GitHub MCP reads only the `GITHUB_PAT_TOKEN` variable and uses a read-only endpoint.
- Cover Fabric, Quilt, Forge, NeoForge, Bukkit/Spigot/Paper/Purpur/Folia, Velocity/Bungee/Waterfall, Sponge, and cross-loader layouts.
- Use project evidence and matching official docs; never guess mappings, loader, version, JDK, scheduler, or build task.
- Do not touch ignored `.cursor/`, `.gradle/`, or `build/` content.

---

### Task 1: Package contract test

**Files:**
- Create: `tests/agent-tooling.test.mjs`

**Interfaces:**
- Consumes: repository files and plugin JSON/YAML/Markdown.
- Produces: Node tests proving the marketplace, manifest, MCP allow-list, five agents, routing skill, nine references, hooks, and secret policy.

- [ ] **Step 1: Write the failing test**

Assert exact names and security properties:

```js
assert.equal(plugin.name, "minecraft-dev");
assert.equal(marketplace.plugins[0].source.path, "./plugins/minecraft-dev");
assert.deepEqual(Object.keys(mcp.mcpServers).sort(), ["context7", "github"]);
assert.equal(mcp.mcpServers.github.url, "https://api.githubcopilot.com/mcp/readonly");
assert.equal(mcp.mcpServers.github.bearer_token_env_var, "GITHUB_PAT_TOKEN");
assert.doesNotMatch(serializedConfig, /gh[pousr]_|Bearer\s+[A-Za-z0-9]/);
```

- [ ] **Step 2: Verify RED**

Run: `node --test tests/agent-tooling.test.mjs`

Expected: FAIL because `.agents/plugins/marketplace.json` and `plugins/minecraft-dev` do not exist.

### Task 2: Plugin, MCP, routing skill, and specialist agents

**Files:**
- Create: `.agents/plugins/marketplace.json`
- Create: `plugins/minecraft-dev/.codex-plugin/plugin.json`
- Create: `plugins/minecraft-dev/.mcp.json`
- Create: `plugins/minecraft-dev/agents/minecraft-project-explorer.md`
- Create: `plugins/minecraft-dev/agents/minecraft-mod-developer.md`
- Create: `plugins/minecraft-dev/agents/minecraft-plugin-developer.md`
- Create: `plugins/minecraft-dev/agents/minecraft-compatibility-architect.md`
- Create: `plugins/minecraft-dev/agents/minecraft-test-engineer.md`
- Create: `plugins/minecraft-dev/skills/minecraft-java-development/SKILL.md`
- Create: `plugins/minecraft-dev/skills/minecraft-java-development/agents/openai.yaml`
- Create: `plugins/minecraft-dev/skills/minecraft-java-development/references/fabric.md`
- Create: `plugins/minecraft-dev/skills/minecraft-java-development/references/quilt.md`
- Create: `plugins/minecraft-dev/skills/minecraft-java-development/references/forge.md`
- Create: `plugins/minecraft-dev/skills/minecraft-java-development/references/neoforge.md`
- Create: `plugins/minecraft-dev/skills/minecraft-java-development/references/paper.md`
- Create: `plugins/minecraft-dev/skills/minecraft-java-development/references/proxy.md`
- Create: `plugins/minecraft-dev/skills/minecraft-java-development/references/sponge.md`
- Create: `plugins/minecraft-dev/skills/minecraft-java-development/references/cross-loader.md`
- Create: `plugins/minecraft-dev/skills/minecraft-java-development/references/testing.md`

**Interfaces:**
- Consumes: detected build/manifests and official documentation URLs.
- Produces: installable `minecraft-dev`, triggerable `minecraft-java-development`, and five role prompts.

- [ ] **Step 1: Generate the plugin skeleton**

Run the installed `plugin-creator` scaffold with `--path "$PWD/plugins"`, `--marketplace-path "$PWD/.agents/plugins/marketplace.json"`, `--with-skills`, `--with-hooks`, `--with-scripts`, `--with-mcp`, `--with-marketplace`, and category `Developer Tools`.

- [ ] **Step 2: Replace generated placeholders**

Use version `0.1.0`, repository `https://github.com/samsepi0l-1337/minecraft_test`, marketplace name `minecraft-test`, and:

```json
{
  "mcpServers": {
    "context7": {"type": "http", "url": "https://mcp.context7.com/mcp"},
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/readonly",
      "bearer_token_env_var": "GITHUB_PAT_TOKEN"
    }
  }
}
```

- [ ] **Step 3: Add progressive-disclosure guidance**

Keep `SKILL.md` focused on detection, routing, safety, implementation, and verification. Put loader/platform-specific lifecycle, mappings, manifests, schedulers, resources, and test commands in the nine direct reference files.

- [ ] **Step 4: Verify the package contract**

Run: `node --test tests/agent-tooling.test.mjs`

Expected: the static package contract passes after all package files exist.

### Task 3: Multi-ecosystem inspector and lifecycle hooks

**Files:**
- Create: `tests/minecraft-project-inspector.test.mjs`
- Create: `plugins/minecraft-dev/hooks.json`
- Create: `plugins/minecraft-dev/scripts/minecraft-project-inspector.mjs`

**Interfaces:**
- Produces: `findProjectRoot(startPath)`, `parseProperties(text)`, `inspectMinecraftProject(root)`, `isRelevantEdit(path)`, and `renderSessionContext(report)`.
- Consumes: those functions from the hook CLI entry point.

- [ ] **Step 1: Write failing unit and fixture tests**

Cover upward root discovery, Gradle properties, current Fabric 1.21.1, Fabric, Quilt, Forge, NeoForge, Paper, Velocity, Bungee, Sponge, cross-loader ambiguity, malformed JSON, outside-project silence, relevant-edit filtering, and irrelevant-edit no-op behavior.

- [ ] **Step 2: Verify RED**

Run: `node --test tests/minecraft-project-inspector.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `minecraft-project-inspector.mjs`.

- [ ] **Step 3: Implement detection and hooks**

Use only `node:fs`, `node:path`, and `node:url`. Recognize JSON manifests by parsing and TOML/YAML manifests by conservative key/coordinate evidence. `SessionStart` prints observed ecosystem/build/version/JDK/mappings/module facts. `PostToolUse` reads bounded JSON input, re-runs detection only after build/manifest edits, and fails open on malformed input.

- [ ] **Step 4: Verify GREEN and real behavior**

Run:

```bash
node --test tests/minecraft-project-inspector.test.mjs
node plugins/minecraft-dev/scripts/minecraft-project-inspector.mjs SessionStart
printf '{"tool_input":{"file_path":"build.gradle"}}' | node plugins/minecraft-dev/scripts/minecraft-project-inspector.mjs PostToolUse
```

Expected: tests pass; session output reports only Fabric, Minecraft 1.21.1, Mojang mappings, and Java 21; the relevant edit emits the refreshed summary.

### Task 4: Repository guidance and installation

**Files:**
- Create: `AGENTS.md`
- Create: `README.md`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: marketplace/plugin names, supported ecosystem list, and wrapper conventions.
- Produces: contributor rules, install commands, credential guidance, and runtime ignores.

- [ ] **Step 1: Document workflow and platform matrix**

Document `codex plugin marketplace add "$PWD"`, `codex plugin add minecraft-dev@minecraft-test`, optional `GITHUB_PAT_TOKEN`, ecosystem detection, official-source policy, Node tests, and wrapper-based project verification.

- [ ] **Step 2: Extend ignore rules**

Ignore `run/`, `.idea/`, `*.iml`, local environment files, server worlds/logs/crashes, and EULA files while preserving tracked `.agents/` metadata.

- [ ] **Step 3: Validate and install**

Run:

```bash
python3 <skill-creator>/scripts/quick_validate.py plugins/minecraft-dev/skills/minecraft-java-development
codex plugin marketplace add "$PWD"
codex plugin add minecraft-dev@minecraft-test
codex plugin list
```

Expected: skill validation succeeds and `minecraft-dev@minecraft-test` is installed and enabled.

### Task 5: Full verification and public delivery

**Files:**
- Verify all files changed since design commit `4359fc1`.

**Interfaces:**
- Consumes: every prior deliverable.
- Produces: independent review, clean implementation commit, pushed `origin/main`, and public remote evidence.

- [ ] **Step 1: Run full verification**

Run:

```bash
node --test tests/*.test.mjs
./gradlew check
./gradlew build
git diff --check
git status --short
```

Expected: all validation commands exit `0` and only intended files are listed.

- [ ] **Step 2: Request independent review**

Ask a fresh reviewer to compare the diff with the design, ecosystem coverage, security rules, plugin schema, and fresh test evidence. Resolve every critical or important finding.

- [ ] **Step 3: Commit and push**

Run:

```bash
git add .agents plugins tests AGENTS.md README.md .gitignore docs/superpowers
git commit -m "feat: add comprehensive Minecraft agent tooling"
git push origin main
```

- [ ] **Step 4: Verify public remote state**

Compare `HEAD` with `origin/main` and query `gh repo view samsepi0l-1337/minecraft_test --json visibility,url,defaultBranchRef`.

Expected: local and remote hashes match and visibility is `PUBLIC`.
