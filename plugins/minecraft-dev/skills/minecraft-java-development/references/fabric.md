# Fabric

## Detect and preserve

- Confirm the `fabric-loom` Gradle plugin and `src/main/resources/fabric.mod.json` before treating a project as Fabric.
- Read `gradle.properties`, the mappings dependency, `fabric_loader_version`, and `fabric_version`; preserve every pinned version unless the task explicitly requests an upgrade.
- Preserve the repository's mappings namespace. Do not mix Yarn names with official Mojang names in one source set.
- Derive Java from the target Minecraft version. Use Java 21 for Minecraft 1.21.1.
- Run the checked-in wrapper. Do not replace it with a globally installed Gradle or a newer Loom/template combination.

## Implement

- Keep common, client, and server entrypoints aligned with `fabric.mod.json` and their source-set boundaries.
- Keep client-only classes out of dedicated-server code paths.
- Reuse existing Fabric API modules, access wideners, Mixin configuration, generated-resource directories, and registration patterns.
- Run data generation only when the project already configures it or the request requires it. Keep its output path consistent with the build.

## Verify

- Inspect available tasks first when the build is unfamiliar: `./gradlew tasks --all`.
- Run the nearest test task, then `./gradlew build`.
- Run `./gradlew runDatagen` only when that task exists and generated data is in scope.
- Verify the remapped JAR and validate that `fabric.mod.json`, Mixin files, access wideners, and generated resources are packaged.

## Pitfalls

- Do not copy current default-template versions into an older project. Open the documentation version matching the repository's Minecraft version.
- Do not migrate Yarn to Mojang mappings, or the reverse, as incidental cleanup.
- Do not start a client or dedicated server as a routine hook; use an explicit disposable smoke-test lane.

## Official references

- [Fabric development documentation](https://docs.fabricmc.net/develop/)
- [Fabric 1.21.1 development documentation](https://docs.fabricmc.net/1.21.1/develop/)
- [Fabric data-generation setup for 1.21.1](https://docs.fabricmc.net/1.21.1/develop/data-generation/setup)
- [Fabric automatic testing for 1.21.1](https://docs.fabricmc.net/1.21.1/develop/automatic-testing)
