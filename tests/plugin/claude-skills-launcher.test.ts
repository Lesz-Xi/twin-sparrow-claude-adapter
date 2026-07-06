import { readFileSync, statSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

test("Claude Desktop claude-skills launcher keeps a stable uvx boundary", () => {
  const launcherPath = "scripts/claude-skills-mcp-launcher.sh";
  const launcher = readFileSync(launcherPath, "utf8");
  const mode = statSync(launcherPath).mode;

  assert.equal((mode & 0o111) !== 0, true);
  assert.match(launcher, /TWIN_CLAUDE_SKILLS_UVX/);
  assert.match(launcher, /TWIN_CLAUDE_SKILLS_CONFIG/);
  assert.match(launcher, /config\/claude-skills-mcp\.json/);
  assert.match(launcher, /UV_PYTHON=\"\$\{UV_PYTHON:-3\.12\}\"/);
  assert.match(launcher, /--from claude-skills-mcp claude-skills-mcp/);
  assert.match(launcher, /--config \"\$\{CONFIG_PATH\}\"/);
  assert.match(launcher, /PYTHONUNBUFFERED=1/);
});

test("Claude Skills MCP config includes Twin-Sparrow local skills", () => {
  const config = JSON.parse(readFileSync("config/claude-skills-mcp.json", "utf8")) as {
    readonly skill_sources?: readonly { readonly type?: string; readonly path?: string; readonly url?: string }[];
  };

  const sources = config.skill_sources ?? [];
  assert.ok(sources.some((source) => source.type === "local" && source.path === "~/.twin-sparrow/agent/skills"));
  assert.ok(sources.some((source) => source.type === "local" && source.path === "~/.claude/skills"));
});
