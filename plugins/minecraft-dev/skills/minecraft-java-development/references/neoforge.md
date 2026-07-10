# NeoForge

## Detect and preserve

- Confirm `net.neoforged.moddev` or `net.neoforged.gradle.userdev`, a `net.neoforged:neoforge` dependency, and `src/main/resources/META-INF/neoforge.mods.toml` or an older `META-INF/mods.toml`. Corroborate a legacy descriptor with the build coordinates instead of classifying by filename alone.
- Identify whether the repository uses ModDevGradle or NeoGradle. Preserve that choice and every pinned Minecraft, NeoForge, plugin, wrapper, and Java version.
- Preserve official Mojang names. Treat Parchment as an optional community documentation layer only when the build already selects it.
- Use Java 21 for Minecraft 1.21.1.

## Implement

- Follow the detected NeoForge version's registration, event, sided-code, networking, data, and configuration APIs.
- Keep `neoforge.mods.toml`, access transformers, Mixins, run profiles, and generated-resource source sets synchronized with code.
- Use the configured generated-resource directory, commonly `src/generated/resources`; do not invent a second output tree.
- Use ModDevGradle unit-test integration only when the pinned plugin version supports and configures it.

## Verify

- Run `./gradlew tasks --all` when task support is uncertain.
- Run the nearest configured unit tests and `./gradlew build` with the checked-in wrapper.
- Run data-generation or GameTest tasks only when present and required by the changed behavior.
- Verify the production JAR contains `META-INF/neoforge.mods.toml`, generated data, Mixins, and access-transformer resources.

## Pitfalls

- Do not migrate NeoGradle to ModDevGradle, or the reverse, as a setup side effect.
- Do not copy a current NeoForge MDK over a pinned 1.21.1 project.
- Do not mix Forge `mods.toml` conventions with NeoForge `neoforge.mods.toml`.
- Never accept an EULA, disable authentication, or launch a persistent server during ordinary verification.

## Official references

- [NeoForge 1.21.1 getting started](https://docs.neoforged.net/docs/1.21.1/gettingstarted/)
- [Official 1.21.1 ModDevGradle MDK](https://github.com/NeoForgeMDKs/MDK-1.21.1-ModDevGradle)
- [Official 1.21.1 NeoGradle MDK](https://github.com/NeoForgeMDKs/MDK-1.21.1-NeoGradle)
- [ModDevGradle plugin documentation](https://docs.neoforged.net/toolchain/docs/plugins/mdg/)
- [NeoForge Parchment guidance](https://docs.neoforged.net/toolchain/docs/parchment/)
- [NeoForge 1.21.1 migration primer](https://docs.neoforged.net/primer/docs/1.21.1/)
