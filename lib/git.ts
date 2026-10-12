import { stat } from "node:fs/promises";
import * as path from "node:path";

/**
 * 指定ファイル/ディレクトリのパスを基点に git コマンドを実行する。
 * ディレクトリでない場合は親ディレクトリを基点にする。
 * パスが存在しない場合は git を起動せず code 1 を返す (git 管理外として扱う)。
 */
const git = async (filepath: string, args: string[]) => {
  let cwd: string;
  try {
    cwd = (await stat(filepath)).isDirectory()
      ? filepath
      : path.dirname(filepath);
  } catch (e) {
    return {
      code: 1,
      stdout: "",
      stderr: e instanceof Error ? e.message : String(e),
    };
  }
  const proc = Bun.spawn(["git", "-C", cwd, ...args], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const [code, stdout, stderr] = await Promise.all([
    proc.exited,
    proc.stdout.text(),
    proc.stderr.text(),
  ]);
  return { code, stdout, stderr };
};

/**
 * 指定ファイル/ディレクトリが属する git リポジトリのルートパスを返す。
 * git 管理下でない場合はエラーを投げる。
 */
export const root = async (filepath: string): Promise<string> => {
  const { code, stdout, stderr } = await git(filepath, [
    "rev-parse",
    "--show-toplevel",
  ]);
  if (code !== 0) {
    throw new Error(stderr);
  }
  return stdout.trim();
};

/**
 * 指定ファイル/ディレクトリが git 管理下にあるかどうかを返す。
 */
export const managed = async (filepath: string): Promise<boolean> => {
  const { code } = await git(filepath, ["rev-parse"]);
  return code === 0;
};
