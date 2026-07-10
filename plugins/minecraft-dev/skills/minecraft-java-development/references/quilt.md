# Quilt

## Detect and preserve

- Confirm Quilt Loom or `org.quiltmc.loom` and `src/main/resources/quilt.mod.json` before selecting Quilt guidance.
- Read the exact Loader, Loom, Fabric API/QFAPI, QSL, mappings, Minecraft, and Java versions from the build.
- Preserve existing Quilt dependencies and mappings when maintaining an established project.
- Use Java 21 for Minecraft 1.21.1 and the repository's checked-in wrapper.

## Implement

- Prefer Fabric-compatible APIs for new loader-compatible behavior when the existing architecture permits it.
- Keep Quilt entrypoints, metadata, Mixins, access wideners, and environment boundaries consistent with `quilt.mod.json`.
- Do not introduce QSL or Quilt Mappings into new work. QSL and new Quilt Mappings are no longer maintained for new Minecraft versions.
- Do not remove an existing QSL or Quilt Mappings dependency unless migration is explicitly requested and tested.

## Verify

- Inspect `./gradlew tasks --all`, run the nearest configured tests, then run `./gradlew build`.
- Verify the built JAR contains `quilt.mod.json` and every referenced Mixin or access-widener resource.
- Test Fabric-mod compatibility only when the repository claims it; do not infer compatibility from the loader alone.

## Pitfalls

- Treat the official Quilt developer wiki and template as potentially behind the target release; cross-check the project's pinned versions and official status posts.
- Do not clone a template's default branch to refresh an existing 1.21.1 project.
- Do not convert Quilt to Fabric, or Fabric to Quilt, without an explicit migration request.

## Official references

- [Quilt project overview](https://quiltmc.org/en/about/)
- [Quilt FAQ](https://quiltmc.org/en/about/faq/)
- [Quilt mappings maintenance update](https://quiltmc.org/en/blog/2026-02-03-non-obfuscated-updates/)
- [QFAPI and QSL direction for Minecraft 1.21](https://quiltmc.org/en/blog/2024-07-03-qfapi-moving-forward/)
- [Official Quilt template repository](https://github.com/QuiltMC/quilt-template-mod)
