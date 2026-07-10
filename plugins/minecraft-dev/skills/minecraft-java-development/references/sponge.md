# Sponge

## Detect and preserve

- Confirm `org.spongepowered.gradle.plugin`, an `org.spongepowered:spongeapi` dependency, and `@Plugin` or `META-INF/sponge_plugins.json` metadata.
- Read the exact Sponge API, implementation, Minecraft, Java, Gradle plugin, and wrapper versions before editing.
- Use the official release record and repository build as the version authority when the stable documentation or template lags.
- Use Java 21 for Sponge 12 targeting Minecraft 1.21.1.

## Implement

- Keep lifecycle, event, command, service, configuration, data, scheduler, and dependency-injection code within the detected Sponge API version.
- Keep generated SpongeGradle metadata or manually maintained `sponge_plugins.json` synchronized with the entrypoint and dependencies.
- Avoid implementation internals and Mixins unless the existing project deliberately uses them.
- Keep blocking work off synchronous event and scheduler paths.

## Verify

- Run the checked-in wrapper's nearest tests and full build.
- Inspect the built JAR for `META-INF/sponge_plugins.json`, its entrypoint, declared dependencies, and required resources.
- Run a disposable Sponge server only when the requested behavior needs an integration proof and the repository already documents that path.
- Treat Sponge implementation-contributor tests as distinct from a normal plugin's test contract.

## Pitfalls

- Do not infer current API compatibility from the `stable` docs label; compare the docs, release, and pinned dependency.
- Do not update an older project from the default template branch without an explicit migration plan.
- Do not commit server JARs, run directories, worlds, logs, EULA files, or production configuration.

## Official references

- [Sponge documentation](https://docs.spongepowered.org/stable/en/)
- [Sponge plugin metadata](https://docs.spongepowered.org/stable/en/plugin/plugin-meta.html)
- [Sponge official repository](https://github.com/SpongePowered/Sponge)
- [Sponge releases](https://github.com/SpongePowered/Sponge/releases)
- [Official Sponge plugin template](https://github.com/SpongePowered/sponge-plugin-template)
