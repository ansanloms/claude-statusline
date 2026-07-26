#!/usr/bin/env -S deno run --allow-env --allow-read --allow-run=git

import { cli, define } from "@gunshi/gunshi";
import denoJson from "./deno.json" with { type: "json" };
import { runMain } from "./lib/main.ts";
import { runSub } from "./lib/sub.ts";

const mainCommand = define({
  name: "main",
  description: "Render the status line for the main Claude Code session",
  run: async () => {
    await runMain();
  },
});

const subCommand = define({
  name: "sub",
  description: "Render status lines for subagent tasks (agent panel)",
  run: async () => {
    await runSub();
  },
});

const rootCommand = define({
  name: "claude-statusline",
  description: "Claude Code status line renderer",
  run: () => {
    console.error("Usage: claude-statusline <main|sub>");
    Deno.exit(1);
  },
});

await cli(Deno.args, rootCommand, {
  name: "claude-statusline",
  version: denoJson.version,
  description: "Claude Code status line renderer",
  // gunshi の global options プラグインはコマンド実行前に必ずヘッダーを
  // stdout へ出力する (--help の有無を問わない)。statusline / subagent
  // statusline は生の stdout をそのまま解釈されるため、余計な行を出力
  // フォーマットに混入させないよう明示的に無効化する。
  renderHeader: null,
  subCommands: {
    main: mainCommand,
    sub: subCommand,
  },
});
