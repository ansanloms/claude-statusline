import { describe, expect, test } from "bun:test";
import * as path from "@std/path";
import { loadFixtures } from "./fixtures.ts";

const entryPath = path.fromFileUrl(
  new URL("../statusline.ts", import.meta.url),
);

/**
 * fixture の入力を実際にエントリポイント経由で描画し、stdout の生文字列
 * (ANSI エスケープ込み) を返す。
 *
 * env は親から引き継がず、必要なものだけを明示的に渡す。NO_COLOR 等の
 * 実行環境依存の値がスナップショットへ混入しないようにするため。
 * TZ を固定するのは main の rate limit 表示が toLocaleString でローカル
 * タイムゾーン依存になるため。
 */
const render = async (input: string): Promise<string> => {
  const child = Bun.spawn([process.execPath, entryPath, "main"], {
    env: {
      PATH: process.env.PATH ?? "",
      HOME: process.env.HOME ?? "",
      TZ: "Asia/Tokyo",
      COLUMNS: "100",
    },
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  });

  child.stdin.write(input);
  await child.stdin.end();

  const [code, stdout, stderr] = await Promise.all([
    child.exited,
    child.stdout.text(),
    child.stderr.text(),
  ]);
  if (code !== 0) {
    console.error(stderr);
  }
  expect(code).toBe(0);

  return stdout;
};

const fixtures = await loadFixtures();

describe("main", () => {
  for (const fixture of fixtures) {
    test(fixture.name, async () => {
      const stdout = await render(fixture.input);
      expect(stdout).toMatchSnapshot();
    });
  }
});
