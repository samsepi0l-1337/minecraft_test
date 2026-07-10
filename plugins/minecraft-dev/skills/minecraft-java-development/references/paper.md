# Bukkit, Spigot, Paper, Purpur, and Folia

## Detect and preserve

- Detect the compile API first: `org.bukkit:bukkit`, `org.spigotmc:spigot-api`, `io.papermc.paper:paper-api`, or `org.purpurmc.purpur:purpur-api`.
- Confirm `src/main/resources/plugin.yml` or the experimental `paper-plugin.yml`; do not interchange their loaders or lifecycle rules.
- Read `api-version`, server/API version, Java toolchain, build tool, and any `io.papermc.paperweight.userdev` configuration.
- Use Java 21 for Minecraft 1.21.1. Preserve the repository's target even when current Paper documentation targets a newer release and Java version.

## Implement

- Prefer the narrowest declared API. Target Paper API for Paper-compatible work and use Purpur API only for required Purpur-specific behavior.
- Prefer public API over NMS. Use paperweight-userdev only when internals are necessary and preserve the project's mapping/reobfuscation convention.
- Keep commands, permissions, dependencies, load order, entrypoint, `api-version`, and Folia declarations synchronized with code.
- Keep blocking I/O off event and server threads.
- Treat Folia as a concurrency profile over Paper. Use the correct global, region, entity, and async schedulers and respect ownership boundaries.
- Never add `folia-supported: true` automatically. Add it only after an explicit concurrency audit and Folia-relevant verification.

## Verify

- Use `./gradlew` or `./mvnw` when present, run the nearest tests, then run the full build/package task.
- Inspect the built JAR for the intended descriptor, main class, permissions, commands, and bundled dependencies.
- Use a disposable local Paper/Purpur/Folia server smoke test only when static and unit tests cannot prove behavior.
- Keep MockBukkit or other mock servers optional; they are not an official universal Paper test contract.

## Pitfalls

- Do not assume current Paper 26.x examples or Java requirements apply to Minecraft 1.21.1.
- Do not add Paper, Purpur, or Folia APIs to a Spigot-compatible plugin without an explicit compatibility decision.
- Do not claim Folia support from the metadata flag alone.
- Do not commit server JARs, worlds, player data, logs, EULA files, production configuration, or credentials.

## Official references

- [Paper project setup](https://docs.papermc.io/paper/dev/project-setup/)
- [Paper Java requirements](https://docs.papermc.io/paper/getting-started/)
- [Paper plugin.yml reference](https://docs.papermc.io/paper/dev/plugin-yml/)
- [Paper plugins and paper-plugin.yml](https://docs.papermc.io/paper/dev/getting-started/paper-plugins/)
- [Paperweight userdev](https://docs.papermc.io/paper/dev/userdev/)
- [Folia plugin support](https://docs.papermc.io/paper/dev/folia-support/)
- [Purpur official repository](https://github.com/PurpurMC/Purpur)
- [Spigot Maven guidance](https://www.spigotmc.org/wiki/spigot-maven/)
