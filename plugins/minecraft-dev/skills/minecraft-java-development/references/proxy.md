# Velocity, BungeeCord, and Waterfall

## Detect and preserve

- Detect Velocity from `com.velocitypowered:velocity-api`, its annotation processor, and `@Plugin`; verify generated `velocity-plugin.json` in the built JAR.
- Detect BungeeCord from `net.md-5:bungeecord-api`, a class extending the Bungee `Plugin`, and `bungee.yml` or `plugin.yml`.
- Read the exact proxy API and Java versions. Preserve them instead of imposing a server-plugin toolchain.
- Treat Waterfall as Bungee-compatible legacy maintenance only; Waterfall is end-of-life.

## Implement

- Keep proxy code independent of Bukkit, Paper, and game-server-only APIs.
- For Velocity, keep `compileOnly` and `annotationProcessor` coordinates aligned and use Velocity lifecycle and dependency injection rules.
- For BungeeCord, keep lifecycle, listener, command, scheduler, and descriptor behavior within the Bungee API.
- Validate plugin-message channels and payloads; do not trust messages merely because they arrived through a proxy.
- Keep blocking network, database, and filesystem operations off proxy event threads.
- Scaffold new proxy work for Velocity unless the request explicitly targets BungeeCord. Never scaffold new Waterfall projects.

## Verify

- Use the repository's `./gradlew` or `./mvnw`, run unit tests, then run the full build/package task.
- Inspect the artifact for generated Velocity metadata or the expected Bungee descriptor and main class.
- Use a disposable proxy plus test backend only when an integration behavior cannot be proven otherwise.
- Verify shutdown, reconnect, message validation, and backend-unavailable paths for stateful proxy plugins.

## Pitfalls

- Do not reuse Bukkit `plugin.yml` semantics in Velocity.
- Do not assume Velocity and Bungee scheduler, event, command, or messaging APIs are interchangeable.
- Do not copy current Velocity versions into an older pinned proxy project.
- Do not publish proxy secrets, forwarding secrets, player data, production addresses, or live configuration.

## Official references

- [Velocity developer documentation](https://docs.papermc.io/velocity/dev/)
- [Creating a Velocity plugin](https://docs.papermc.io/velocity/dev/creating-your-first-plugin/)
- [Velocity API basics](https://docs.papermc.io/velocity/dev/api-basics/)
- [Velocity plugin messaging](https://docs.papermc.io/velocity/dev/plugin-messaging/)
- [BungeeCord official repository](https://github.com/SpigotMC/BungeeCord)
- [BungeeCord plugin development](https://www.spigotmc.org/wiki/bungeecord-plugin-development/)
- [Waterfall end-of-life announcement](https://papermc.io/news/announcing-the-end-of-life-of-waterfall/)
