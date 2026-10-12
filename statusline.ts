#!/usr/bin/env bun

import { cli, define } from "@gunshi/gunshi";
import { runMain } from "./lib/main.ts";
import pkg from "./package.json" with { type: "json" };

const mainCommand = define({
  name: "main",
  description: "Render the status line for the main Claude Code session",
  run: async () => {
    await runMain();
  },
});

const rootCommand = define({
  name: "claude-statusline",
  description: "Claude Code status line renderer",
  run: () => {
    console.error("Usage: claude-statusline <main>");
    process.exit(1);
  },
});

await cli(process.argv.slice(2), rootCommand, {
  name: "claude-statusline",
  version: pkg.version,
  description: "Claude Code status line renderer",
  // gunshi の global options プラグインはコマンド実行前に必ずヘッダーを
  // stdout へ出力する (--help の有無を問わない)。statusline は生の stdout を
  // そのまま解釈されるため、余計な行を出力フォーマットに混入させないよう
  // 明示的に無効化する。
  renderHeader: null,
  subCommands: {
    main: mainCommand,
  },
});
