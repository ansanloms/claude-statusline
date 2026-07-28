import * as path from "@std/path";

/**
 * fixture 1 件分のデータ。
 */
export interface Fixture {
  /** 拡張子を除いたファイル名 (例: "basic")。 */
  name: string;

  /** fixture の種別。読み込み対象のディレクトリ (fixtures/<kind>/) に対応する。 */
  kind: "main" | "sub";

  /** "{{PROJECT_DIR}}" 置換済みの JSON 文字列。 */
  input: string;
}

// リポジトリルート。fixture 内の "{{PROJECT_DIR}}" プレースホルダの置換先。
// 末尾セパレータの除去は path.resolve に任せる。正規表現で SEPARATOR を
// 埋め込むと Windows ("\") でエスケープ扱いになり除去できないため。
const projectDir = path.resolve(
  path.fromFileUrl(new URL("..", import.meta.url)),
);

/**
 * fixtures/<kind>/ 配下の *.json をファイル名昇順で読み込み、
 * "{{PROJECT_DIR}}" プレースホルダをリポジトリルート絶対パスへ置換して返す。
 */
export const loadFixtures = async (
  kind: "main" | "sub",
): Promise<Fixture[]> => {
  const dir = path.join(projectDir, "fixtures", kind);

  const names: string[] = [];
  for await (const entry of Deno.readDir(dir)) {
    if (entry.isFile && entry.name.endsWith(".json")) {
      names.push(entry.name);
    }
  }
  names.sort();

  const fixtures: Fixture[] = [];
  for (const name of names) {
    const raw = await Deno.readTextFile(path.join(dir, name));
    fixtures.push({
      name: name.replace(/\.json$/, ""),
      kind,
      input: raw.replaceAll("{{PROJECT_DIR}}", projectDir),
    });
  }
  return fixtures;
};
