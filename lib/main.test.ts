import { expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { stripAnsiCode } from "@std/fmt/colors";
import * as path from "@std/path";

// エントリポイント (statusline.ts) を実際に spawn して疎通させる統合テスト。
// mockInput は移植元の statusline.test.ts (手動スモークスクリプト) を流用する。

const entryPath = path.fromFileUrl(
  new URL("../statusline.ts", import.meta.url),
);

test("main: statusline を stdout に出力する", async () => {
  const tmpDir = await mkdtemp(path.join(tmpdir(), "claude-statusline-"));
  try {
    const mockInput = {
      hook_event_name: "Status",
      session_id: "test-session-123",
      transcript_path: "/tmp/test-transcript",
      cwd: tmpDir,
      model: {
        id: "claude-sonnet-4-6",
        display_name: "Sonnet",
      },
      workspace: {
        current_dir: tmpDir,
        project_dir: tmpDir,
      },
      version: "1.0.0",
      output_style: {
        name: "default",
      },
      cost: {
        total_cost_usd: 0.0123,
        total_duration_ms: 45000,
        total_api_duration_ms: 2300,
        total_lines_added: 10,
        total_lines_removed: 3,
      },
      rate_limits: {
        five_hour: {
          used_percentage: 23.5,
          resets_at: 1738425600,
        },
        seven_day: {
          used_percentage: 41.2,
          resets_at: 1738857600,
        },
      },
      context_window: {
        total_input_tokens: 15000,
        total_output_tokens: 4000,
        context_window_size: 200000,
        used_percentage: 8,
        remaining_percentage: 92,
        current_usage: {
          input_tokens: 8500,
          output_tokens: 1200,
          cache_creation_input_tokens: 5000,
          cache_read_input_tokens: 2000,
        },
      },
    };

    const child = Bun.spawn([process.execPath, entryPath, "main"], {
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe",
    });

    child.stdin.write(JSON.stringify(mockInput));
    await child.stdin.end();

    const [code, rawOut, stderr] = await Promise.all([
      child.exited,
      child.stdout.text(),
      child.stderr.text(),
    ]);
    // ANSI エスケープが単語の途中(色境界)に挟まることがあるため、
    // 文字列比較は stripAnsiCode 後に行う。
    const out = stripAnsiCode(rawOut);

    if (code !== 0) {
      console.error(stderr);
    }
    expect(code).toBe(0);
    expect(out.includes("Sonnet")).toBe(true);
    expect(out.includes("test-session-123")).toBe(true);
    expect(out.includes("Token")).toBe(true);
    expect(out.includes("Limit 5h")).toBe(true);
    expect(out.includes("Limit 7d")).toBe(true);
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
});
