import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  findProjectRoot,
  inspectMinecraftProject,
  isRelevantEdit,
  parseProperties,
  renderSessionContext,
} from "../plugins/minecraft-dev/scripts/minecraft-project-inspector.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const temporaryRoots = new Set();

async function temporaryProject(files) {
  const root = await mkdtemp(join(tmpdir(), "minecraft-inspector-"));
  temporaryRoots.add(root);

  for (const [path, contents] of Object.entries(files)) {
    const absolutePath = join(root, path);
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, contents);
  }

  return root;
}

test.after(async () => {
  await Promise.all(
    [...temporaryRoots].map((root) => rm(root, { recursive: true, force: true })),
  );
});

test("parses Gradle properties without treating comments as data", () => {
  assert.deepEqual(
    parseProperties("# comment\nminecraft_version = 1.21.1\njava_version=21\ninvalid\n"),
    { minecraft_version: "1.21.1", java_version: "21" },
  );
});

test("finds a Minecraft project root from a nested source path", async () => {
  const root = await temporaryProject({
    "settings.gradle": "rootProject.name = 'fixture'\n",
    "build.gradle": "plugins { id 'fabric-loom' version '1.7' }\n",
    "src/main/resources/fabric.mod.json": '{"id":"fixture"}\n',
    "src/main/java/example/Fixture.java": "class Fixture {}\n",
  });

  assert.equal(
    await findProjectRoot(join(root, "src/main/java/example")),
    root,
  );
  assert.equal(await findProjectRoot(tmpdir()), null);
});

test("detects the repository's Fabric 1.21.1 contract without false targets", async () => {
  const report = await inspectMinecraftProject(repositoryRoot);

  assert.deepEqual(report.targets, ["fabric"]);
  assert.deepEqual(report.buildSystems, ["gradle"]);
  assert.equal(report.minecraftVersion, "1.21.1");
  assert.equal(report.javaVersion, "21");
  assert.equal(report.mappings, "mojang-official");
  assert.equal(report.topology, "single-platform");
  assert.deepEqual(report.wrappers, { gradle: "9.4.1" });
  assert.deepEqual(report.sourceSets, ["client", "main"]);
  assert.deepEqual(report.platformVersions, {
    fabricApi: "0.116.12+1.21.1",
    fabricLoader: "0.19.2",
    loom: "1.16-SNAPSHOT",
  });
  assert.match(renderSessionContext(report), /Fabric/);
  assert.match(renderSessionContext(report), /Gradle 9\.4\.1/);
  assert.match(renderSessionContext(report), /Fabric Loader 0\.19\.2/);
  assert.doesNotMatch(renderSessionContext(report), /Forge|Paper|Velocity/);
});

test("detects Fabric, Quilt, Forge, and NeoForge fixtures", async (t) => {
  const fixtures = [
    {
      name: "Fabric",
      target: "fabric",
      files: {
        "build.gradle": "plugins { id 'fabric-loom' version '1.7' }\n",
        "gradle.properties": "minecraft_version=1.21.1\n",
        "src/main/resources/fabric.mod.json": '{"id":"fabric_fixture","depends":{"minecraft":"~1.21.1"}}',
      },
    },
    {
      name: "Quilt",
      target: "quilt",
      files: {
        "build.gradle": "plugins { id 'org.quiltmc.loom' version '1.7' }\n",
        "src/main/resources/quilt.mod.json": '{"quilt_loader":{"id":"quilt_fixture"}}',
      },
    },
    {
      name: "Forge",
      target: "forge",
      files: {
        "build.gradle": "plugins { id 'net.minecraftforge.gradle' version '[6.0,6.2)' }\ndependencies { minecraft 'net.minecraftforge:forge:1.21.1-52.1.0' }\n",
        "src/main/resources/META-INF/mods.toml": "modLoader=\"javafml\"\n[[mods]]\nmodId=\"forge_fixture\"\n",
      },
    },
    {
      name: "NeoForge",
      target: "neoforge",
      files: {
        "build.gradle": "plugins { id 'net.neoforged.moddev' version '2.0.0' }\ndependencies { implementation 'net.neoforged:neoforge:21.1.1' }\n",
        "src/main/resources/META-INF/neoforge.mods.toml": "modLoader=\"javafml\"\n[[mods]]\nmodId=\"neoforge_fixture\"\n",
      },
    },
  ];

  for (const fixture of fixtures) {
    await t.test(fixture.name, async () => {
      const root = await temporaryProject(fixture.files);
      const report = await inspectMinecraftProject(root);
      assert.deepEqual(report.targets, [fixture.target]);
    });
  }
});

test("distinguishes Bukkit descriptors, Paper plugins, and Folia declarations", async (t) => {
  const paperRoot = await temporaryProject({
    "pom.xml": "<project><dependency><artifactId>paper-api</artifactId></dependency></project>",
    "src/main/resources/plugin.yml": "name: Fixture\nmain: example.Fixture\napi-version: '1.21'\n",
  });
  const paperPluginRoot = await temporaryProject({
    "build.gradle.kts": "dependencies { compileOnly(\"io.papermc.paper:paper-api:1.21.1-R0.1-SNAPSHOT\") }",
    "src/main/resources/paper-plugin.yml": "name: PaperFixture\nmain: example.PaperFixture\napi-version: '1.21'\n",
  });
  const foliaRoot = await temporaryProject({
    "build.gradle": "dependencies { compileOnly 'dev.folia:folia-api:1.21.1-R0.1-SNAPSHOT' }",
    "src/main/resources/plugin.yml": "name: FoliaFixture\nmain: example.FoliaFixture\nfolia-supported: true\n",
  });

  await t.test("Paper API plus plugin.yml", async () => {
    assert.deepEqual((await inspectMinecraftProject(paperRoot)).targets, ["paper"]);
  });
  await t.test("paper-plugin.yml", async () => {
    assert.deepEqual((await inspectMinecraftProject(paperPluginRoot)).targets, ["paper"]);
  });
  await t.test("Folia is an explicit Paper concurrency profile", async () => {
    assert.deepEqual((await inspectMinecraftProject(foliaRoot)).targets, ["folia", "paper"]);
  });
});

test("detects proxy and Sponge plugin fixtures", async (t) => {
  const fixtures = [
    {
      target: "velocity",
      files: {
        "build.gradle": "dependencies { compileOnly 'com.velocitypowered:velocity-api:3.4.0-SNAPSHOT'; annotationProcessor 'com.velocitypowered:velocity-api:3.4.0-SNAPSHOT' }",
        "src/main/java/example/Fixture.java": "import com.velocitypowered.api.plugin.Plugin;\n@Plugin(id=\"fixture\", name=\"Fixture\") class Fixture {}",
      },
    },
    {
      target: "bungeecord",
      files: {
        "pom.xml": "<project><artifactId>bungeecord-api</artifactId></project>",
        "src/main/resources/bungee.yml": "name: Fixture\nmain: example.Fixture\n",
      },
    },
    {
      target: "sponge",
      files: {
        "build.gradle": "plugins { id 'org.spongepowered.gradle.plugin' version '2.2.0' }\ndependencies { implementation 'org.spongepowered:spongeapi:11.0.0' }",
        "src/main/resources/META-INF/sponge_plugins.json": '{"loader":{"name":"java_plain"},"plugins":[{"id":"fixture"}]}',
      },
    },
  ];

  for (const fixture of fixtures) {
    await t.test(fixture.target, async () => {
      assert.deepEqual(
        (await inspectMinecraftProject(await temporaryProject(fixture.files))).targets,
        [fixture.target],
      );
    });
  }
});

test("detects Bukkit, Spigot, Purpur, and legacy Waterfall variants", async (t) => {
  const fixtures = [
    {
      expected: ["bukkit"],
      files: {
        "build.gradle": "plugins { id 'java' }",
        "src/main/resources/plugin.yml": "name: BukkitFixture\nmain: example.BukkitFixture\n",
      },
    },
    {
      expected: ["spigot"],
      files: {
        "pom.xml": "<project><dependency><artifactId>spigot-api</artifactId></dependency></project>",
        "src/main/resources/plugin.yml": "name: SpigotFixture\nmain: example.SpigotFixture\n",
      },
    },
    {
      expected: ["paper", "purpur"],
      files: {
        "build.gradle.kts": "dependencies { compileOnly(\"org.purpurmc.purpur:purpur-api:1.21.1-R0.1-SNAPSHOT\") }",
        "src/main/resources/plugin.yml": "name: PurpurFixture\nmain: example.PurpurFixture\n",
      },
    },
    {
      expected: ["bungeecord", "waterfall"],
      files: {
        "build.gradle": "dependencies { compileOnly 'io.github.waterfallmc:waterfall-api:1.21-R0.1-SNAPSHOT' }",
        "src/main/resources/bungee.yml": "name: WaterfallFixture\nmain: example.WaterfallFixture\n",
      },
    },
  ];

  for (const fixture of fixtures) {
    await t.test(fixture.expected.join("+"), async () => {
      assert.deepEqual(
        (await inspectMinecraftProject(await temporaryProject(fixture.files))).targets,
        fixture.expected,
      );
    });
  }
});

test("uses project-wide NeoForge evidence for legacy mods.toml", async () => {
  const root = await temporaryProject({
    "build.gradle": "plugins { id 'net.neoforged.gradle.userdev' version '7.0.0' }",
    "src/main/resources/META-INF/mods.toml": "modLoader=\"javafml\"\n[[mods]]\nmodId=\"legacy_neoforge\"\n",
  });

  assert.deepEqual((await inspectMinecraftProject(root)).targets, ["neoforge"]);
});

test("reports a cross-loader topology without scanning the plugin's own fixtures", async () => {
  const root = await temporaryProject({
    "settings.gradle": "include 'common', 'fabric', 'neoforge'\n",
    "build.gradle": "plugins { id 'architectury-plugin' version '3.4-SNAPSHOT' }\n",
    "fabric/build.gradle": "plugins { id 'dev.architectury.loom' }\ndependencies { modImplementation 'net.fabricmc:fabric-loader:0.16.0' }",
    "fabric/src/main/resources/fabric.mod.json": '{"id":"fixture"}',
    "neoforge/build.gradle": "plugins { id 'net.neoforged.moddev' version '2.0.0' }",
    "neoforge/src/main/resources/META-INF/neoforge.mods.toml": "modLoader=\"javafml\"",
  });
  const report = await inspectMinecraftProject(root);

  assert.equal(
    await findProjectRoot(join(root, "fabric/src/main/resources")),
    root,
  );
  assert.deepEqual(report.targets, ["fabric", "neoforge"]);
  assert.equal(report.topology, "cross-loader");
  assert.equal(report.architectury, true);
});

test("malformed JSON is a warning and does not erase other evidence", async () => {
  const root = await temporaryProject({
    "build.gradle": "plugins { id 'fabric-loom' version '1.7' }",
    "src/main/resources/fabric.mod.json": "{not json",
  });
  const report = await inspectMinecraftProject(root);

  assert.deepEqual(report.targets, ["fabric"]);
  assert.equal(report.warnings.length, 1);
  assert.match(report.warnings[0], /fabric\.mod\.json/);
});

test("limits post-edit refreshes to Minecraft build and descriptor files", () => {
  assert.equal(isRelevantEdit("build.gradle.kts"), true);
  assert.equal(isRelevantEdit("gradle.properties"), true);
  assert.equal(isRelevantEdit("src/main/resources/META-INF/neoforge.mods.toml"), true);
  assert.equal(isRelevantEdit("src/main/resources/paper-plugin.yml"), true);
  assert.equal(isRelevantEdit("src/main/java/example/Feature.java"), false);
  assert.equal(isRelevantEdit("README.md"), false);
});
