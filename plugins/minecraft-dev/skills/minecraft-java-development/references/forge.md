# Forge

## Detect and preserve

- Confirm `net.minecraftforge.gradle`, a `net.minecraftforge:forge` dependency, and `src/main/resources/META-INF/mods.toml`.
- Read the exact Minecraft, Forge, ForgeGradle, mappings channel/version, Java, and Gradle wrapper versions before editing.
- Preserve official mappings and existing access-transformer, Mixin, run, and generated-resource configuration.
- Use Java 21 for Minecraft 1.21.1 and ForgeGradle 6 projects targeting that release.

## Implement

- Keep registration, event buses, sided code, networking, capabilities, configuration, and lifecycle hooks consistent with the detected Forge version.
- Update `mods.toml` whenever code changes entrypoints, dependencies, version ranges, or display metadata.
- Use the configured `runData` output and existing source-set wiring for generated resources.
- Avoid direct NMS or mapping-name assumptions when a Forge API exists.

## Verify

- Run the checked-in wrapper and inspect tasks when necessary: `./gradlew tasks --all`.
- Run the nearest unit tests and `./gradlew build`.
- Run `./gradlew runData` and `./gradlew runGameTestServer` only when those tasks exist and their behavior is in scope.
- Verify the reobfuscated artifact contains `META-INF/mods.toml`, access transformers, Mixins, and generated resources.

## Pitfalls

- Do not upgrade ForgeGradle, the Gradle wrapper, mappings, or Forge together as incidental maintenance.
- Do not import NeoForge APIs or metadata into a Forge project.
- Do not accept the Minecraft EULA, disable online mode, or launch a persistent server automatically.
- Use the documentation version matching the repository; do not transplant current examples into 1.21.1 blindly.

## Official references

- [Forge 1.21.x getting started](https://docs.minecraftforge.net/en/1.21.x/gettingstarted/)
- [Forge 1.21.x data generation](https://docs.minecraftforge.net/en/1.21.x/datagen/)
- [Forge 1.21.x Game Tests](https://docs.minecraftforge.net/en/1.21.x/misc/gametest/)
- [ForgeGradle 6 documentation](https://docs.minecraftforge.net/en/fg-6.x/)
- [ForgeGradle mappings configuration](https://docs.minecraftforge.net/en/fg-6.x/configuration/)
