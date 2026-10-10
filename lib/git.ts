import { stat } from "node:fs/promises";
import * as path from "@std/path";

/**
 * 指定ファイル/ディレクトリのパスを基点に git コマンドを実行する。
 * ディレクトリでない場合は親ディレクトリを基点にする。
 */
const git = async (filepath: string, args: string[]) => {
  const proc = Bun.spawn(
    [
      "git",
      "-C",
      (await stat(filepath)).isDirectory() ? filepath : path.dirname(filepath),
      ...args,
    ],
    { stdout: "pipe", stderr: "pipe" },
  );
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

/**
 * 指定ファイル/ディレクトリが属する git リポジトリの共通 git ディレクトリ
 * （common dir）の絶対パスを返す。linked worktree から呼んでもメイン worktree
 * の .git を指す。git 管理下でない場合はエラーを投げる。
 */
export const commonDir = async (filepath: string): Promise<string> => {
  const { code, stdout, stderr } = await git(filepath, [
    "rev-parse",
    "--git-common-dir",
  ]);
  if (code !== 0) {
    throw new Error(stderr);
  }

  const raw = stdout.trim();
  // 出力が相対パス（例: ".git"）で返るケースに備え、git 実行基点で絶対化する。
  const base = (await stat(filepath)).isDirectory()
    ? filepath
    : path.dirname(filepath);
  return path.resolve(base, raw);
};

/**
 * 指定ファイル/ディレクトリが属する git リポジトリのメイン worktree の
 * ルートパスを返す。linked worktree から呼んでもメイン worktree を指す。
 */
export const mainRoot = async (filepath: string): Promise<string> => {
  return path.dirname(await commonDir(filepath));
};
