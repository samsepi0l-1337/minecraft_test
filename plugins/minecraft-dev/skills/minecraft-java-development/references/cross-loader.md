# Cross-loader and Architectury

## Detect and preserve

- Confirm `architectury-plugin` and/or `dev.architectury.loom`, plus a common module and loader-specific modules such as `fabric`, `forge`, `neoforge`, or `quilt`.
- Inspect `settings.gradle*`, root and subproject builds, mapping declarations, and every loader descriptor before changing shared code.
- Preserve the exact Minecraft, Architectury Plugin/Loom/API, loader, mappings, Java, and wrapper versions.
- Use Java 21 for Minecraft 1.21.1 even when a generic Loom document states a lower minimum.

## Implement

- Put only genuinely portable logic in the common module. Keep registration, lifecycle, networking, metadata, entrypoints, and loader APIs in platform modules or established abstractions.
- Preserve the selected mapping namespace across all subprojects.
- Keep `fabric.mod.json`, `mods.toml`, `neoforge.mods.toml`, or `quilt.mod.json` synchronized within their owning modules.
- Treat Architectury API as optional; do not add it merely because Architectury Loom or Plugin is present.
- Do not convert a single-loader repository to Architectury without an explicit architecture and migration request.

## Verify

- Run the root wrapper's full build so every configured loader module is compiled and packaged.
- Run focused tests for common logic and loader-specific tests for platform bindings.
- Inspect every production artifact for the correct descriptor, mappings/remapping result, common classes, resources, and entrypoint.
- Run data generation in only the configured owning module and verify generated resources are consumed by all intended targets.

## Pitfalls

- Architectury Loom and Architectury Plugin are documented as experimental; preserve pinned combinations and avoid opportunistic upgrades.
- Do not use the archived Architectury example mod as a current template.
- Do not layer Parchment, Yarn, or Mojang mappings differently across subprojects unless the existing build explicitly handles the translation.
- Do not claim cross-loader compatibility after building only one platform.

## Official references

- [Architectury documentation](https://docs.architectury.dev/)
- [Architectury Loom introduction](https://docs.architectury.dev/loom/introduction/)
- [Architectury Plugin introduction](https://docs.architectury.dev/plugin/introduction/)
- [Architectury getting started](https://docs.architectury.dev/plugin/get_started)
- [Architectury template generator](https://generate.architectury.dev/)
- [Architectury Loom repository](https://github.com/architectury/architectury-loom)
