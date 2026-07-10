#!/usr/bin/env node

import { readdir, readFile, stat } from "node:fs/promises";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_FILES = 4_000;
const MAX_ENTRIES = 20_000;
const MAX_DEPTH = 12;
const MAX_INPUT_BYTES = 64 * 1024;
const MAX_TEXT_BYTES = 1024 * 1024;

const BUILD_FILE_NAMES = new Set([
  "build.gradle",
  "build.gradle.kts",
  "gradle.properties",
  "gradle-wrapper.properties",
  "libs.versions.toml",
  "maven-wrapper.properties",
  "pom.xml",
  "settings.gradle",
  "settings.gradle.kts",
]);

const DESCRIPTOR_FILE_NAMES = new Set([
  "bungee.yml",
  "fabric.mod.json",
  "neoforge.mods.toml",
  "mods.toml",
  "paper-plugin.yml",
  "plugin.yml",
  "quilt.mod.json",
  "sponge_plugins.json",
  "velocity-plugin.json",
]);

const EXCLUDED_DIRECTORY_NAMES = new Set([
  ".agents",
  ".git",
  ".gradle",
  ".idea",
  ".omx",
  "build",
  "crash-reports",
  "docs",
  "logs",
  "node_modules",
  "out",
  "run",
  "target",
  "tests",
  "world",
  "world_nether",
  "world_the_end",
]);

const ROOT_SIGNAL_PATTERN = /(?:fabric-loom|org\.quiltmc|net\.minecraftforge|net\.neoforged|paper-api|paperweight|purpur-api|folia-api|velocity-api|bungeecord-api|spongeapi|org\.spongepowered|architectury-plugin|dev\.architectury\.loom)/i;

const TARGET_LABELS = {
  bukkit: "Bukkit",
  bungeecord: "BungeeCord",
  fabric: "Fabric",
  folia: "Folia",
  forge: "Forge",
  neoforge: "NeoForge",
  paper: "Paper",
  purpur: "Purpur",
  quilt: "Quilt",
  spigot: "Spigot",
  sponge: "Sponge",
  velocity: "Velocity",
  waterfall: "Waterfall",
};

const PLATFORM_VERSION_LABELS = {
  bungeecord: "BungeeCord API",
  fabricApi: "Fabric API",
  fabricLoader: "Fabric Loader",
  folia: "Folia API",
  forge: "Forge",
  loom: "Loom",
  neoforge: "NeoForge",
  paper: "Paper API",
  purpur: "Purpur API",
  quiltLoader: "Quilt Loader",
  sponge: "Sponge API",
  spigot: "Spigot API",
  velocity: "Velocity API",
  waterfall: "Waterfall API",
};

export function parseProperties(text) {
  const properties = {};

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line.startsWith("!")) continue;

    const separator = line.indexOf("=");
    if (separator < 1) continue;

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (key) properties[key] = value;
  }

  return properties;
}

function shouldSkipDirectory(root, directoryPath, name) {
  if (EXCLUDED_DIRECTORY_NAMES.has(name)) return true;

  const projectRelative = relative(root, directoryPath).split("\\").join("/");
  return projectRelative === "plugins/minecraft-dev";
}

function shouldReadFile(name) {
  if (BUILD_FILE_NAMES.has(name) || DESCRIPTOR_FILE_NAMES.has(name)) return true;
  return extname(name) === ".java" || extname(name) === ".kt";
}

async function collectProjectFiles(root, { maxDepth = MAX_DEPTH } = {}) {
  const files = [];
  let visited = 0;
  let visitedEntries = 0;

  async function visit(directory, depth) {
    if (depth > maxDepth || visited >= MAX_FILES || visitedEntries >= MAX_ENTRIES) return;

    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      return;
    }

    entries.sort((left, right) => left.name.localeCompare(right.name));

    for (const entry of entries) {
      visitedEntries += 1;
      if (visited >= MAX_FILES || visitedEntries >= MAX_ENTRIES) return;
      const path = join(directory, entry.name);

      if (entry.isDirectory()) {
        if (!shouldSkipDirectory(root, path, entry.name)) {
          await visit(path, depth + 1);
        }
        continue;
      }

      if (!entry.isFile() || !shouldReadFile(entry.name)) continue;
      visited += 1;
      files.push(path);
    }
  }

  await visit(root, 0);
  return files;
}

async function readText(path) {
  try {
    const metadata = await stat(path);
    if (!metadata.isFile() || metadata.size > MAX_TEXT_BYTES) return "";
    return await readFile(path, "utf8");
  } catch {
    return "";
  }
}

async function isMinecraftRoot(directory) {
  let directEntries;
  try {
    directEntries = await readdir(directory, { withFileTypes: true });
  } catch {
    return false;
  }

  const directBuildFiles = directEntries
    .filter((entry) => entry.isFile() && BUILD_FILE_NAMES.has(entry.name))
    .map((entry) => join(directory, entry.name));
  if (directBuildFiles.length === 0) return false;

  for (const path of directBuildFiles) {
    if (ROOT_SIGNAL_PATTERN.test(await readText(path))) return true;
  }

  const files = await collectProjectFiles(directory, { maxDepth: 8 });
  return files.some((path) => DESCRIPTOR_FILE_NAMES.has(basename(path)));
}

export async function findProjectRoot(startPath = process.cwd()) {
  let current = resolve(startPath);
  try {
    if (!(await stat(current)).isDirectory()) current = dirname(current);
  } catch {
    current = dirname(current);
  }

  const candidates = [];
  while (true) {
    if (await isMinecraftRoot(current)) candidates.push(current);
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }

  if (candidates.length === 0) return null;
  const nearest = candidates[0];
  let selected = nearest;
  for (const candidate of candidates.slice(1)) {
    if (await ownsNestedProject(candidate, nearest)) selected = candidate;
  }
  return selected;
}

async function ownsNestedProject(candidate, nestedProject) {
  if (candidate === nestedProject) return true;
  const nestedRelative = relative(candidate, nestedProject).split("\\").join("/");
  if (!nestedRelative || nestedRelative.startsWith("../")) return false;

  const configuration = (
    await Promise.all(
      ["settings.gradle", "settings.gradle.kts", "pom.xml"].map((name) =>
        readText(join(candidate, name)),
      ),
    )
  ).join("\n");
  const colonPath = `:${nestedRelative.replaceAll("/", ":")}`;
  const markers = [
    `"${nestedRelative}"`,
    `'${nestedRelative}'`,
    `"${colonPath}"`,
    `'${colonPath}'`,
    `<module>${nestedRelative}</module>`,
  ];
  return markers.some((marker) => configuration.includes(marker));
}

function addEvidence(evidence, target, path, root) {
  if (!evidence[target]) evidence[target] = [];
  const shortPath = relative(root, path).split("\\").join("/") || basename(path);
  if (!evidence[target].includes(shortPath)) evidence[target].push(shortPath);
}

function firstProperty(properties, names) {
  for (const name of names) {
    const value = properties[name];
    if (value) return value;
  }
  return null;
}

function firstMatch(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return null;
}

function inferProjectKind(targets) {
  const modTargets = new Set(["fabric", "forge", "neoforge", "quilt"]);
  const serverTargets = new Set(["bukkit", "folia", "paper", "purpur", "spigot", "sponge"]);
  const proxyTargets = new Set(["bungeecord", "velocity", "waterfall"]);
  const kinds = new Set();

  if (targets.some((target) => modTargets.has(target))) kinds.add("mod");
  if (targets.some((target) => serverTargets.has(target))) kinds.add("server-plugin");
  if (targets.some((target) => proxyTargets.has(target))) kinds.add("proxy-plugin");

  if (kinds.size === 0) return "unknown";
  if (kinds.size > 1) return "mixed";
  return [...kinds][0];
}

function inferTopology(targets, architectury) {
  const modTargetCount = targets.filter((target) =>
    ["fabric", "forge", "neoforge", "quilt"].includes(target),
  ).length;
  if (modTargetCount > 1 || (architectury && modTargetCount > 0)) return "cross-loader";

  const kind = inferProjectKind(targets);
  if (kind === "mixed") return "hybrid";
  if (targets.length > 0) return "single-platform";
  return "unknown";
}

function inferMappings(text) {
  const mappings = [];
  if (/officialMojangMappings|mappings\s*(?:channel\s*[:=]\s*)?["']official|loom\.officialMojangMappings/i.test(text)) {
    mappings.push("mojang-official");
  }
  if (/net\.fabricmc:yarn|quilt-mappings|mappings\s+.*\byarn\b/i.test(text)) {
    mappings.push(/quilt-mappings/i.test(text) ? "quilt" : "yarn");
  }
  if (/parchmentmc|parchment/i.test(text)) mappings.push("parchment-enhanced");

  const unique = [...new Set(mappings)];
  if (unique.length === 0) return "unknown";
  if (unique.length === 1) return unique[0];
  return `mixed (${unique.join(", ")})`;
}

function inferWrappers(records) {
  const wrappers = {};

  for (const { name, text } of records) {
    if (name === "gradle-wrapper.properties") {
      const version = firstMatch(text, [/gradle-([0-9][0-9A-Za-z.+-]*)-(?:bin|all)\.zip/i]);
      if (version) wrappers.gradle = version;
    }
    if (name === "maven-wrapper.properties") {
      const version = firstMatch(text, [/apache-maven-([0-9][0-9A-Za-z.+-]*)-bin\.zip/i]);
      if (version) wrappers.maven = version;
    }
  }

  return wrappers;
}

function inferSourceSets(records) {
  const sourceSets = new Set();
  for (const { shortPath } of records) {
    const match = shortPath.match(/(?:^|\/)src\/([^/]+)/);
    if (match?.[1]) sourceSets.add(match[1]);
  }
  return [...sourceSets].sort();
}

function inferModules(records) {
  const modules = new Set(["root"]);

  for (const { name, shortPath, text } of records) {
    if (name === "settings.gradle" || name === "settings.gradle.kts") {
      for (const line of text.split(/\r?\n/)) {
        if (!/\binclude\b/.test(line)) continue;
        for (const match of line.matchAll(/["'](:?[^"']+)["']/g)) {
          const module = match[1].replace(/^:/, "").replaceAll(":", "/");
          if (module) modules.add(module);
        }
      }
    }

    if (name === "build.gradle" || name === "build.gradle.kts" || name === "pom.xml") {
      const directory = dirname(shortPath).split("\\").join("/");
      if (directory !== ".") modules.add(directory);
    }
  }

  return [...modules].sort((left, right) => {
    if (left === "root") return -1;
    if (right === "root") return 1;
    return left.localeCompare(right);
  });
}

function inferPlatformVersions(properties, text, targets) {
  const hasTarget = (target) => targets.includes(target);
  const candidates = [
    ["fabricApi", hasTarget("fabric") ? firstProperty(properties, ["fabric_api_version", "fabric_version"]) || firstMatch(text, [/net\.fabricmc\.fabric-api:fabric-api:([^"'\s)]+)/i]) : null],
    ["fabricLoader", hasTarget("fabric") ? firstProperty(properties, ["loader_version", "fabric_loader_version"]) || firstMatch(text, [/net\.fabricmc:fabric-loader:([^"'\s)]+)/i]) : null],
    ["loom", firstProperty(properties, ["loom_version"])],
    ["quiltLoader", hasTarget("quilt") ? firstProperty(properties, ["quilt_loader_version", "loader_version"]) || firstMatch(text, [/org\.quiltmc:quilt-loader:([^"'\s)]+)/i]) : null],
    ["forge", hasTarget("forge") ? firstProperty(properties, ["forge_version"]) || firstMatch(text, [/net\.minecraftforge:forge:([^"'\s)]+)/i]) : null],
    ["neoforge", hasTarget("neoforge") ? firstProperty(properties, ["neo_version", "neoforge_version"]) || firstMatch(text, [/net\.neoforged:neoforge:([^"'\s)]+)/i]) : null],
    ["paper", hasTarget("paper") ? firstProperty(properties, ["paper_version"]) || firstMatch(text, [/io\.papermc\.paper:paper-api:([^"'\s)]+)/i]) : null],
    ["purpur", hasTarget("purpur") ? firstProperty(properties, ["purpur_version"]) || firstMatch(text, [/org\.purpurmc\.purpur:purpur-api:([^"'\s)]+)/i]) : null],
    ["folia", hasTarget("folia") ? firstProperty(properties, ["folia_version"]) || firstMatch(text, [/dev\.folia:folia-api:([^"'\s)]+)/i]) : null],
    ["spigot", hasTarget("spigot") ? firstProperty(properties, ["spigot_version"]) || firstMatch(text, [/org\.spigotmc:spigot-api:([^"'\s)]+)/i]) : null],
    ["velocity", hasTarget("velocity") ? firstProperty(properties, ["velocity_version"]) || firstMatch(text, [/com\.velocitypowered:velocity-api:([^"'\s)]+)/i]) : null],
    ["bungeecord", hasTarget("bungeecord") ? firstProperty(properties, ["bungeecord_version"]) || firstMatch(text, [/net\.md-5:bungeecord-api:([^"'\s)]+)/i]) : null],
    ["waterfall", hasTarget("waterfall") ? firstProperty(properties, ["waterfall_version"]) || firstMatch(text, [/(?:io\.github\.waterfallmc|io\.papermc\.waterfall):waterfall-api:([^"'\s)]+)/i]) : null],
    ["sponge", hasTarget("sponge") ? firstProperty(properties, ["sponge_version", "spongeapi_version"]) || firstMatch(text, [/org\.spongepowered:spongeapi:([^"'\s)]+)/i]) : null],
  ];

  return Object.fromEntries(candidates.filter(([, value]) => value));
}

export async function inspectMinecraftProject(rootPath) {
  const root = resolve(rootPath);
  const paths = await collectProjectFiles(root);
  const records = [];
  const properties = {};
  const warnings = [];
  const evidence = {};
  const targets = new Set();
  const buildSystems = new Set();

  for (const path of paths) {
    const name = basename(path);
    const text = await readText(path);
    const shortPath = relative(root, path).split("\\").join("/");
    records.push({ path, shortPath, name, text });

    if (["build.gradle", "build.gradle.kts", "settings.gradle", "settings.gradle.kts", "gradle.properties", "gradle-wrapper.properties", "libs.versions.toml"].includes(name)) {
      buildSystems.add("gradle");
    }
    if (name === "pom.xml" || name === "maven-wrapper.properties") buildSystems.add("maven");
    if (name === "gradle.properties") Object.assign(properties, parseProperties(text));

    if (["fabric.mod.json", "quilt.mod.json", "sponge_plugins.json", "velocity-plugin.json"].includes(name)) {
      try {
        JSON.parse(text);
      } catch {
        warnings.push(`${shortPath}: malformed JSON metadata`);
      }
    }
  }

  const allText = records.map(({ text }) => text).join("\n");
  const architectury = /architectury-plugin|dev\.architectury\.loom|architectury_loom/i.test(allText);
  const repositoryHasNeoForgeSignal = /net\.neoforged(?:\.moddev|\.gradle|:neoforge)|neogradle/i.test(allText);

  function detect(target, record) {
    targets.add(target);
    addEvidence(evidence, target, record.path, root);
  }

  for (const record of records) {
    const { name, text } = record;

    if (name === "fabric.mod.json" || /\bfabric-loom(?:-remap)?\b/i.test(text)) {
      detect("fabric", record);
    }
    if (name === "quilt.mod.json" || /org\.quiltmc(?:\.loom)?|quilt-loader/i.test(text)) {
      detect("quilt", record);
    }

    const neoForgeSignal =
      name === "neoforge.mods.toml" ||
      /net\.neoforged(?:\.moddev|\.gradle|:neoforge)|neogradle/i.test(text);
    if (neoForgeSignal) detect("neoforge", record);

    const forgeSignal =
      /net\.minecraftforge(?:\.gradle|:forge)|forgegradle/i.test(text) ||
      (name === "mods.toml" && !repositoryHasNeoForgeSignal);
    if (forgeSignal) detect("forge", record);

    if (
      name === "paper-plugin.yml" ||
      /io\.papermc\.paper:paper-api|<artifactId>paper-api<\/artifactId>|paperweight\.userdev/i.test(text)
    ) {
      detect("paper", record);
    }
    if (/org\.purpurmc\.purpur:purpur-api|purpur-api/i.test(text)) {
      detect("paper", record);
      detect("purpur", record);
    }
    if (/dev\.folia:folia-api|folia-supported\s*:\s*true/i.test(text)) {
      detect("paper", record);
      detect("folia", record);
    }
    if (/org\.spigotmc:spigot-api|spigot-api/i.test(text)) detect("spigot", record);
    if (/org\.bukkit:bukkit|bukkit-api/i.test(text)) detect("bukkit", record);

    if (name === "velocity-plugin.json" || /velocity-api|com\.velocitypowered\.api\.plugin\.Plugin/i.test(text)) {
      detect("velocity", record);
    }
    if (name === "bungee.yml" || /bungeecord-api|net\.md_5\.bungee\.api\.plugin\.Plugin/i.test(text)) {
      detect("bungeecord", record);
    }
    if (/waterfall-api|io\.github\.waterfallmc/i.test(text)) {
      detect("bungeecord", record);
      detect("waterfall", record);
    }
    if (name === "sponge_plugins.json" || /org\.spongepowered(?:\.gradle\.plugin|:spongeapi)|spongeapi|org\.spongepowered\.plugin\.builtin\.jvm\.Plugin/i.test(text)) {
      detect("sponge", record);
    }
  }

  const pluginDescriptor = records.find(({ name }) => name === "plugin.yml");
  if (pluginDescriptor && !["paper", "purpur", "folia", "spigot", "bukkit"].some((target) => targets.has(target))) {
    detect("bukkit", pluginDescriptor);
  }

  const sortedTargets = [...targets].sort();
  const minecraftVersion =
    firstProperty(properties, [
      "minecraft_version",
      "minecraft.version",
      "minecraftVersion",
      "mc_version",
      "mcVersion",
    ]) ||
    firstMatch(allText, [
      /com\.mojang:minecraft:([^"'\s)]+)/i,
      /net\.minecraftforge:forge:([0-9]+\.[0-9]+(?:\.[0-9]+)?)/i,
      /(?:paper|purpur|folia)-api:([0-9]+\.[0-9]+(?:\.[0-9]+)?)/i,
      /<minecraft\.version>([^<]+)<\/minecraft\.version>/i,
    ]) ||
    "unknown";
  const javaVersion =
    firstProperty(properties, ["java_version", "java.version", "javaVersion"]) ||
    firstMatch(allText, [
      /options\.release\s*=\s*([0-9]+)/i,
      /JavaVersion\.VERSION_([0-9]+)/i,
      /JavaLanguageVersion\.of\(([0-9]+)\)/i,
      /jvmToolchain\(([0-9]+)\)/i,
      /<maven\.compiler\.release>([0-9]+)<\/maven\.compiler\.release>/i,
    ]) ||
    "unknown";

  return {
    root,
    projectKind: inferProjectKind(sortedTargets),
    topology: inferTopology(sortedTargets, architectury),
    targets: sortedTargets,
    buildSystems: [...buildSystems].sort(),
    minecraftVersion,
    javaVersion,
    mappings: inferMappings(allText),
    wrappers: inferWrappers(records),
    modules: inferModules(records),
    sourceSets: inferSourceSets(records),
    platformVersions: inferPlatformVersions(properties, allText, sortedTargets),
    architectury,
    evidence,
    warnings,
  };
}

export function isRelevantEdit(path) {
  if (typeof path !== "string" || path.length === 0) return false;
  const name = basename(path).toLowerCase();
  if (BUILD_FILE_NAMES.has(name) || DESCRIPTOR_FILE_NAMES.has(name)) return true;
  return name === "gradle-wrapper.properties" || name === "maven-wrapper.properties";
}

export function renderSessionContext(report) {
  const targets = report.targets.map((target) => TARGET_LABELS[target] ?? target).join(", ") || "unknown";
  const buildSystems = report.buildSystems.join(", ") || "unknown";
  const wrappers = Object.entries(report.wrappers)
    .map(([name, version]) => `${name === "gradle" ? "Gradle" : "Maven"} ${version}`)
    .join(", ");
  const platformVersions = Object.entries(report.platformVersions)
    .map(([name, version]) => `${PLATFORM_VERSION_LABELS[name] ?? name} ${version}`)
    .join(", ");
  const lines = [
    "Minecraft Java project context (observed; preserve unless explicitly migrating):",
    `- Root: ${report.root}`,
    `- Kind/topology: ${report.projectKind} / ${report.topology}`,
    `- Targets: ${targets}`,
    `- Build: ${buildSystems}`,
    `- Minecraft/API version: ${report.minecraftVersion}`,
    `- Java: ${report.javaVersion}`,
    `- Mappings: ${report.mappings}`,
  ];
  if (wrappers) lines.push(`- Wrapper: ${wrappers}`);
  if (platformVersions) lines.push(`- Declared platform versions: ${platformVersions}`);
  if (report.modules.length > 1) lines.push(`- Modules: ${report.modules.join(", ")}`);
  if (report.sourceSets.length > 0) lines.push(`- Source sets: ${report.sourceSets.join(", ")}`);
  if (report.architectury) lines.push("- Cross-loader framework signal: Architectury");
  if (report.warnings.length > 0) lines.push(`- Metadata warnings: ${report.warnings.join("; ")}`);
  lines.push("Use the project wrapper and version-matched official documentation; do not auto-run servers, accept EULAs, or migrate loaders/mappings.");
  return lines.join("\n");
}

async function readHookInput() {
  const chunks = [];
  let size = 0;

  try {
    for await (const chunk of process.stdin) {
      size += chunk.length;
      if (size > MAX_INPUT_BYTES) return null;
      chunks.push(chunk);
    }
    if (chunks.length === 0) return null;
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return null;
  }
}

function hookFilePath(payload) {
  return (
    payload?.tool_input?.file_path ??
    payload?.tool_input?.path ??
    payload?.toolInput?.file_path ??
    payload?.toolInput?.path ??
    null
  );
}

async function main() {
  const event = process.argv[2] ?? "SessionStart";
  if (event === "PostToolUse") {
    const payload = await readHookInput();
    if (!isRelevantEdit(hookFilePath(payload))) return;
  }

  if (event !== "SessionStart" && event !== "PostToolUse") return;
  const root = await findProjectRoot(process.cwd());
  if (!root) return;

  const report = await inspectMinecraftProject(root);
  if (report.targets.length === 0) return;
  process.stdout.write(`${renderSessionContext(report)}\n`);
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === currentFile) {
  await main();
}
