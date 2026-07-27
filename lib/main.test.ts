import { assert, assertEquals } from "@std/assert";
import { stripAnsiCode } from "@std/fmt/colors";
import * as path from "@std/path";

// エントリポイント (statusline.ts) を実際に spawn して疎通させる統合テスト。
// mockInput は移植元の statusline.test.ts (手動スモークスクリプト) を流用する。

const entryPath = path.fromFileUrl(
  new URL("../statusline.ts", import.meta.url),
);

// エントリポイント (statusline.ts) の shebang と同じ権限セットで spawn する。
// -A で流すと必要権限の増加に気づけず、実運用の statusline だけが黙って壊れるため。
const runArgs = [
  "run",
  "--allow-env",
  "--allow-read",
  "--allow-run=git",
  entryPath,
];

Deno.test("main: statusline を stdout に出力する", async () => {
  const tmpDir = await Deno.makeTempDir();
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

    const command = new Deno.Command(Deno.execPath(), {
      args: [...runArgs, "main"],
      stdin: "piped",
      stdout: "piped",
      stderr: "piped",
    });
    const child = command.spawn();

    const writer = child.stdin.getWriter();
    await writer.write(new TextEncoder().encode(JSON.stringify(mockInput)));
    await writer.close();

    const { code, stdout, stderr } = await child.output();
    // ANSI エスケープが単語の途中(色境界)に挟まることがあるため、
    // 文字列比較は stripAnsiCode 後に行う。
    const out = stripAnsiCode(new TextDecoder().decode(stdout));

    if (code !== 0) {
      console.error(new TextDecoder().decode(stderr));
    }
    assertEquals(code, 0);
    assert(out.includes("Sonnet"));
    assert(out.includes("test-session-123"));
    assert(out.includes("Token"));
    assert(out.includes("Limit 5h"));
    assert(out.includes("Limit 7d"));
  } finally {
    await Deno.remove(tmpDir, { recursive: true });
  }
});

Deno.test("sub: subagent の行を JSON で出力する", async () => {
  const mockInput = {
    hook_event_name: "SubagentStatus",
    session_id: "s",
    transcript_path: "/tmp/x",
    cwd: "/tmp",
    columns: 120,
    tasks: [
      {
        id: "t1",
        name: "implementer",
        type: "implementer",
        status: "running",
        description: "テスト",
        model: "claude-sonnet-5",
      },
    ],
  };

  const command = new Deno.Command(Deno.execPath(), {
    args: [...runArgs, "sub"],
    stdin: "piped",
    stdout: "piped",
    stderr: "piped",
  });
  const child = command.spawn();

  const writer = child.stdin.getWriter();
  await writer.write(new TextEncoder().encode(JSON.stringify(mockInput)));
  await writer.close();

  const { code, stdout, stderr } = await child.output();
  const out = new TextDecoder().decode(stdout);

  if (code !== 0) {
    console.error(new TextDecoder().decode(stderr));
  }
  assertEquals(code, 0);
  const firstLine = out.split("\n")[0];
  const parsed = JSON.parse(firstLine);
  assertEquals(parsed.id, "t1");
});
