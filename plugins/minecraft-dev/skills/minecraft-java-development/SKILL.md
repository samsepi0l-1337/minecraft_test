---
name: minecraft-java-development
description: Detect, implement, test, and verify Minecraft Java Edition mods and plugins across Fabric, Quilt, Forge, NeoForge, Bukkit, Spigot, Paper, Purpur, Folia, Velocity, BungeeCord, Waterfall, Sponge, and cross-loader repositories. Use whenever a task changes Minecraft Java source, build configuration, metadata, mappings, resources, data generation, networking, scheduling, commands, permissions, or packaged artifacts.
---

# Minecraft Java development

Treat the repository as the source of truth. Detect its existing platform, Minecraft or API version, Java target, mappings, build wrapper, module layout, descriptors, and available tasks before proposing code.

## Route the work

1. Run `node "${PLUGIN_ROOT}/scripts/minecraft-project-inspector.mjs" SessionStart` when the plugin is installed, or inspect `settings.gradle*`, `build.gradle*`, `pom.xml`, `gradle.properties`, wrapper files, dependency coordinates, and runtime descriptors manually.
2. Record observed facts and mark missing values as unknown. Do not infer a loader from a directory name alone.
3. Load only the directly relevant reference:
   - Fabric: `references/fabric.md`
   - Quilt: `references/quilt.md`
   - Forge: `references/forge.md`
   - NeoForge: `references/neoforge.md`
   - Bukkit, Spigot, Paper, Purpur, or Folia: `references/paper.md`
   - Velocity, BungeeCord, or Waterfall: `references/proxy.md`
   - Sponge: `references/sponge.md`
   - Architectury or another multi-loader layout: `references/cross-loader.md`
4. Always load `references/testing.md` before claiming completion.

## Preserve compatibility

- Keep the repository's Minecraft/API version, Java toolchain, loader/plugin version, mappings namespace, dependency ranges, source sets, and wrapper versions unless the user explicitly requests a migration.
- Resolve placeholders through `gradle.properties`, Maven properties, version catalogs, and resource expansion before interpreting them.
- Check version-matched official documentation before using a version-sensitive API. Context7 is a discovery aid, not final authority.
- Distinguish Model Context Protocol (the MCP servers bundled here) from the historical Minecraft Mod Coder Pack. Never assume an `MCP` reference means one or the other without context.
- Do not copy a current template or current documentation example into an older project until its version contract is verified.

## Implement safely

- Keep common, client, dedicated-server, loader, server-plugin, and proxy-plugin code in their declared boundaries.
- Prefer the platform's native lifecycle, registries, events, networking, schedulers, configuration, metadata, and data-generation mechanisms.
- Never accept a Minecraft EULA, download or launch a server, disable authentication, alter production configuration, or migrate mappings/loaders from an automatic hook.
- Treat Folia compatibility as a concurrency claim that requires scheduler and region/entity ownership evidence; never add `folia-supported: true` speculatively.
- Do not add retired Quilt QSL/Quilt Mappings to new latest-version projects, or scaffold new Waterfall projects. Preserve and verify legacy repositories instead.
- Keep credentials, player data, worlds, logs, crash reports, server JARs, and decompiled/copyrighted Minecraft sources out of commits.

## Verify proportionally

1. Add the smallest regression proof close to the changed behavior.
2. Run targeted unit, loader-aware, GameTest, or metadata checks that the repository already configures.
3. Run the project wrapper (`./gradlew` or `./mvnw`) rather than a machine-global build tool.
4. Run only tasks shown by the project; do not invent `runData`, GameTest, server, or proxy tasks.
5. Inspect every declared target artifact in a cross-loader build and report exact commands, exit codes, artifact paths, and any unverified runtime behavior.
