import { describe, snapshot, test } from "node:test";
import * as path from "@std/path";
import { run } from "./exec.ts";
import { loadFixtures } from "./fixtures.ts";

// 既定シリアライザ (JSON.stringify) だと 1 行のエスケープ文字列になるため、
// 複数行・生 ESC のまま保存する恒等シリアライザを登録する。
snapshot.setDefaultSnapshotSerializers([(value) => value]);

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
  const { code, stdout, stderr } = await run(
    process.execPath,
    [entryPath, "main"],
    {
      env: {
        PATH: process.env.PATH ?? "",
        HOME: process.env.HOME ?? "",
        TZ: "Asia/Tokyo",
        COLUMNS: "100",
      },
      input,
    },
  );
  if (code !== 0) {
    console.error(stderr);
    throw new Error(`exit code: ${code}`);
  }
  return stdout;
};

const fixtures = await loadFixtures();

describe("main", () => {
  for (const fixture of fixtures) {
    test(fixture.name, async (t) => {
      const stdout = await render(fixture.input);
      t.assert.snapshot(stdout);
    });
  }
});
