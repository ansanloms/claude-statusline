/**
 * Storybook 相当のプレビュースクリプト。
 * fixtures/main/*.json をすべてエントリポイント (statusline.ts) 経由で
 * 実際に描画し、並べて表示する。目視での見た目確認用。
 */
import * as path from "@std/path";
import { run } from "../lib/exec.ts";
import { loadFixtures } from "../lib/fixtures.ts";

const entryPath = path.fromFileUrl(
  new URL("../statusline.ts", import.meta.url),
);

/**
 * 端末幅。非 TTY 環境 (CI・パイプ経由の実行) では process.stdout.columns が
 * undefined になるため、COLUMNS 環境変数 → 固定値 80 の順でフォールバックする。
 */
const getColumns = (): number => {
  if (process.stdout.columns) {
    return process.stdout.columns;
  }
  const cols = Number(process.env.COLUMNS);
  return Number.isFinite(cols) && cols > 0 ? cols : 80;
};

const columns = getColumns();

/**
 * fixture 1 件を実際にエントリポイント経由で描画し、stdout をそのまま返す。
 */
const render = (input: string) =>
  run(process.execPath, [entryPath, "main"], {
    env: { ...process.env, COLUMNS: String(columns) },
    input,
  });

let hasError = false;

const fixtures = await loadFixtures();

for (const fixture of fixtures) {
  console.log(`── main/${fixture.name} ` + "─".repeat(40));

  const { code, stdout, stderr } = await render(fixture.input);

  if (code !== 0) {
    console.error(stderr);
    hasError = true;
    continue;
  }

  console.log(stdout);
  console.log();
}

if (hasError) {
  process.exit(1);
}
