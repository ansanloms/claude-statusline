/**
 * Storybook 相当のプレビュースクリプト。
 * fixtures/{main,sub}/*.json をすべてエントリポイント (statusline.ts) 経由で
 * 実際に描画し、並べて表示する。目視での見た目確認用。
 */
import * as path from "@std/path";
import { loadFixtures } from "../lib/fixtures.ts";

const entryPath = path.fromFileUrl(
  new URL("../statusline.ts", import.meta.url),
);

/**
 * 端末幅。非 TTY 環境 (CI・パイプ経由の実行) では Deno.consoleSize() が
 * throw するため、COLUMNS 環境変数 → 固定値 80 の順でフォールバックする。
 * COLUMNS を先に見るのは lib/main.ts の幅決定と同じく、パイプ先でも
 * 幅を外から指定できるようにするため。
 */
const getColumns = (): number => {
  try {
    return Deno.consoleSize().columns;
  } catch {
    const cols = Number(Deno.env.get("COLUMNS"));
    return Number.isFinite(cols) && cols > 0 ? cols : 80;
  }
};

const columns = getColumns();

/**
 * fixture 1 件を実際にエントリポイント経由で描画し、stdout をそのまま返す。
 */
const render = async (
  command: "main" | "sub",
  input: string,
): Promise<{ code: number; stdout: string; stderr: string }> => {
  const child = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "--allow-env",
      "--allow-read",
      "--allow-run=git",
      entryPath,
      command,
    ],
    env: { COLUMNS: String(columns) },
    stdin: "piped",
    stdout: "piped",
    stderr: "piped",
  }).spawn();

  const writer = child.stdin.getWriter();
  await writer.write(new TextEncoder().encode(input));
  await writer.close();

  const { code, stdout, stderr } = await child.output();
  return {
    code,
    stdout: new TextDecoder().decode(stdout),
    stderr: new TextDecoder().decode(stderr),
  };
};

let hasError = false;

for (const kind of ["main", "sub"] as const) {
  const fixtures = await loadFixtures(kind);

  for (const fixture of fixtures) {
    console.log(`── ${kind}/${fixture.name} ` + "─".repeat(40));

    const { code, stdout, stderr } = await render(kind, fixture.input);

    if (code !== 0) {
      console.error(stderr);
      hasError = true;
      continue;
    }

    if (kind === "main") {
      console.log(stdout);
    } else {
      const lines = stdout.split("\n").filter((line) => line.trim() !== "");
      if (lines.length === 0) {
        console.log("(no output)");
      } else {
        for (const line of lines) {
          const { content } = JSON.parse(line);
          console.log(content);
        }
      }
    }
    console.log();
  }
}

if (hasError) {
  Deno.exit(1);
}
