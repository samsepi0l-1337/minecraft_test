import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pluginRoot = join(repositoryRoot, "plugins", "minecraft-dev");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

test("repository marketplace exposes the Minecraft development plugin", async () => {
  const marketplace = await readJson(
    join(repositoryRoot, ".agents", "plugins", "marketplace.json"),
  );

  assert.equal(marketplace.name, "minecraft-test");
  assert.equal(marketplace.interface.displayName, "Minecraft Test");
  assert.deepEqual(marketplace.plugins, [
    {
      name: "minecraft-dev",
      source: {
        source: "local",
        path: "./plugins/minecraft-dev",
      },
      policy: {
        installation: "AVAILABLE",
        authentication: "ON_INSTALL",
      },
      category: "Developer Tools",
    },
  ]);
});

test("plugin manifest has publishable metadata and no placeholders", async () => {
  const manifestPath = join(pluginRoot, ".codex-plugin", "plugin.json");
  const manifestText = await readFile(manifestPath, "utf8");
  const manifest = JSON.parse(manifestText);

  assert.equal(manifest.name, "minecraft-dev");
  assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
  assert.equal(manifest.skills, "./skills/");
  assert.equal(manifest.mcpServers, "./.mcp.json");
  assert.equal(manifest.repository, "https://github.com/samsepi0l-1337/minecraft_test");
  assert.equal(manifest.license, "CC0-1.0");
  assert.deepEqual(manifest.interface.capabilities, ["Interactive", "Read", "Write"]);
  assert.doesNotMatch(manifestText, /\[TODO:|\bTBD\b/);
  assert.equal("hooks" in manifest, false);
});

test("MCP allow-list is HTTPS, read-only for GitHub, and secret-free", async () => {
  const mcpPath = join(pluginRoot, ".mcp.json");
  const mcpText = await readFile(mcpPath, "utf8");
  const mcp = JSON.parse(mcpText);

  assert.deepEqual(Object.keys(mcp.mcpServers).sort(), ["context7", "github"]);
  assert.equal(mcp.mcpServers.context7.url, "https://mcp.context7.com/mcp");
  assert.equal(
    mcp.mcpServers.github.url,
    "https://api.githubcopilot.com/mcp/readonly",
  );
  assert.equal(mcp.mcpServers.github.bearer_token_env_var, "GITHUB_PAT_TOKEN");
  assert.doesNotMatch(mcpText, /gh[pousr]_[A-Za-z0-9]+|Bearer\s+[A-Za-z0-9]/);
});

test("plugin ships specialist agents and the routing skill", async () => {
  const agentNames = [
    "minecraft-project-explorer",
    "minecraft-mod-developer",
    "minecraft-plugin-developer",
    "minecraft-compatibility-architect",
    "minecraft-test-engineer",
  ];
  for (const agentName of agentNames) {
    const agent = await readFile(join(pluginRoot, "agents", `${agentName}.md`), "utf8");
    assert.match(agent, new RegExp(`^---\\nname: ${agentName}\\n`));
    assert.match(agent, /description: .+\n---/s);
  }

  const skillRoot = join(pluginRoot, "skills", "minecraft-java-development");
  const skill = await readFile(join(skillRoot, "SKILL.md"), "utf8");
  assert.match(skill, /^---\nname: minecraft-java-development\n/);
  assert.match(skill, /description: .+\n---/s);
  assert.match(skill, /gradle\.properties/);
  assert.match(skill, /official documentation/i);
  assert.match(skill, /Fabric/);
  assert.match(skill, /NeoForge/);
  assert.match(skill, /Paper/);
  assert.match(skill, /Velocity/);

  const openaiYaml = await readFile(join(skillRoot, "agents", "openai.yaml"), "utf8");
  assert.match(openaiYaml, /allow_implicit_invocation: true/);

  const references = [
    "fabric",
    "quilt",
    "forge",
    "neoforge",
    "paper",
    "proxy",
    "sponge",
    "cross-loader",
    "testing",
  ];
  for (const reference of references) {
    const contents = await readFile(join(skillRoot, "references", `${reference}.md`), "utf8");
    assert.match(contents, /^# /);
    assert.match(contents, /https:\/\//);
  }
});

test("plugin provides auto-discovered lifecycle hooks", async () => {
  const hooks = await readJson(join(pluginRoot, "hooks.json"));
  assert.deepEqual(Object.keys(hooks.hooks).sort(), ["PostToolUse", "SessionStart"]);
  assert.match(JSON.stringify(hooks), /\$\{PLUGIN_ROOT\}/);
  assert.doesNotMatch(JSON.stringify(hooks), /gradlew|mvnw|eula/i);
});

test("repository guidance documents scope, install, and verification", async () => {
  const agents = await readFile(join(repositoryRoot, "AGENTS.md"), "utf8");
  const readme = await readFile(join(repositoryRoot, "README.md"), "utf8");

  assert.match(agents, /Minecraft Java Edition/);
  assert.match(agents, /Fabric/);
  assert.match(agents, /Forge/);
  assert.match(agents, /Paper/);
  assert.match(agents, /Velocity/);
  assert.match(agents, /project wrapper/i);
  assert.match(readme, /codex plugin marketplace add "\$PWD"/);
  assert.match(readme, /minecraft-dev@minecraft-test/);
  assert.match(readme, /GITHUB_PAT_TOKEN/);
  assert.match(readme, /node --test tests\/\*\.test\.mjs/);
  assert.match(readme, /\.\/gradlew build/);
});
