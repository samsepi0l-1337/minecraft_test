# Testing and verification

## Establish the test contract

- Detect the loader/API, Minecraft version, Java toolchain, mappings, modules, descriptors, and existing test framework before selecting commands.
- Use `./gradlew` or `./mvnw` whenever present. If no wrapper exists, follow the repository's documented build tool; do not install or upgrade one silently.
- Inspect available Gradle tasks with `./gradlew tasks --all` before invoking loader-specific data-generation, GameTest, client, server, or reobfuscation tasks.
- Open the official documentation version matching the pinned Minecraft/API release. Do not transplant latest-version commands or dependencies into an older project.

## Use the smallest proving ladder

1. Run pure unit tests for version-independent logic.
2. Run loader-aware JUnit or mock tests already configured by the repository.
3. Run GameTests when the loader supplies them and the changed behavior interacts with the game world.
4. Run data generation when generated assets or data changed, then review the diff.
5. Run the full wrapper build and inspect production artifacts.
6. Use a disposable local client, server, or proxy smoke test only when earlier layers cannot prove the behavior.

## Verify artifacts and compatibility

- Check the final JAR, not only compilation. Verify the expected manifest/descriptor, entrypoints, Mixins, access widener/transformer, generated metadata, resources, and bundled dependencies.
- Verify remapped or reobfuscated artifacts for Fabric, Forge, NeoForge, Paper NMS, and every cross-loader target that requires them.
- Test dedicated-server class loading for mods with client code.
- Test reload, disable/shutdown, reconnect, backend failure, configuration migration, and invalid input when the changed behavior owns those paths.
- For Folia, audit scheduler choice and region/entity ownership before accepting `folia-supported: true`.

## Keep tests safe and reproducible

- Never accept an EULA, disable online mode, contact production services, or reuse a live world as an implicit test step.
- Never commit server/client JARs, decompiled Minecraft sources, run directories, worlds, logs, player data, EULA files, forwarding secrets, or credentials.
- Bind disposable test servers and proxies to loopback, use isolated temporary directories, and tear them down deterministically.
- Treat MockBukkit and similar libraries as optional community tools, not official universal contracts.
- Do not make networked server launches part of pre-commit hooks. Keep hooks deterministic and reserve integration smoke tests for explicit verification or CI lanes.

## Official references

- [Fabric automatic testing for 1.21.1](https://docs.fabricmc.net/1.21.1/develop/automatic-testing)
- [Fabric data-generation setup for 1.21.1](https://docs.fabricmc.net/1.21.1/develop/data-generation/setup)
- [Forge Game Tests for 1.21.x](https://docs.minecraftforge.net/en/1.21.x/misc/gametest/)
- [Forge data generation for 1.21.x](https://docs.minecraftforge.net/en/1.21.x/datagen/)
- [NeoForge ModDevGradle documentation](https://docs.neoforged.net/toolchain/docs/plugins/mdg/)
- [Paper project setup](https://docs.papermc.io/paper/dev/project-setup/)
- [Gradle Wrapper documentation](https://docs.gradle.org/current/userguide/gradle_wrapper.html)
