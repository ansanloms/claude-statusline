import { assertEquals } from "@std/assert";
import { assertSnapshot } from "@std/testing/snapshot";
import * as path from "@std/path";
import { loadFixtures } from "./fixtures.ts";

const entryPath = path.fromFileUrl(
  new URL("../statusline.ts", import.meta.url),
);

/**
 * fixture の入力を実際にエントリポイント経由で描画し、stdout の生文字列
 * (ANSI エスケープ込み) を返す。
 *
 * env は clearEnv で遮断し、必要なものだけを明示的に渡す。NO_COLOR 等の
 * 実行環境依存の値がスナップショットへ混入しないようにするため。
 * TZ を固定するのは main の rate limit 表示が toLocaleString でローカル
 * タイムゾーン依存になるため。
 */
const render = async (
  command: "main" | "sub",
  input: string,
): Promise<string> => {
  const child = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "--allow-env",
      "--allow-read",
      "--allow-run=git",
      entryPath,
      command,
    ],
    clearEnv: true,
    env: {
      PATH: Deno.env.get("PATH") ?? "",
      HOME: Deno.env.get("HOME") ?? "",
      TZ: "Asia/Tokyo",
      COLUMNS: "100",
    },
    stdin: "piped",
    stdout: "piped",
    stderr: "piped",
  }).spawn();

  const writer = child.stdin.getWriter();
  await writer.write(new TextEncoder().encode(input));
  await writer.close();

  const { code, stdout, stderr } = await child.output();
  if (code !== 0) {
    console.error(new TextDecoder().decode(stderr));
  }
  assertEquals(code, 0);

  return new TextDecoder().decode(stdout);
};

Deno.test("main: fixture の描画結果をスナップショットと比較する", async (t) => {
  const fixtures = await loadFixtures("main");
  for (const fixture of fixtures) {
    await t.step(fixture.name, async (t) => {
      const stdout = await render("main", fixture.input);
      await assertSnapshot(t, stdout);
    });
  }
});

Deno.test("sub: fixture の描画結果をスナップショットと比較する", async (t) => {
  const fixtures = await loadFixtures("sub");
  for (const fixture of fixtures) {
    await t.step(fixture.name, async (t) => {
      const stdout = await render("sub", fixture.input);
      await assertSnapshot(t, stdout);
    });
  }
});
