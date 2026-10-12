import { readdir, readFile } from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * fixture 1 件分のデータ。
 */
export interface Fixture {
  /** 拡張子を除いたファイル名 (例: "basic")。 */
  name: string;

  /** "{{PROJECT_DIR}}" 置換済みの JSON 文字列。 */
  input: string;
}

// リポジトリルート。fixture 内の "{{PROJECT_DIR}}" プレースホルダの置換先。
// 末尾セパレータの除去は path.resolve に任せる。正規表現でセパレータを
// 埋め込むと Windows ("\") でエスケープ扱いになり除去できないため。
const projectDir = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

/**
 * fixtures/main/ 配下の *.json をファイル名昇順で読み込み、
 * "{{PROJECT_DIR}}" プレースホルダをリポジトリルート絶対パスへ置換して返す。
 */
export const loadFixtures = async (): Promise<Fixture[]> => {
  const dir = path.join(projectDir, "fixtures", "main");

  const names = (await readdir(dir, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort();

  const fixtures: Fixture[] = [];
  for (const name of names) {
    const raw = await readFile(path.join(dir, name), "utf8");
    fixtures.push({
      name: name.replace(/\.json$/, ""),
      input: raw.replaceAll("{{PROJECT_DIR}}", projectDir),
    });
  }
  return fixtures;
};
