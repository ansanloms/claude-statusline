import { execFile } from "node:child_process";
import { promisify } from "node:util";

/**
 * コマンドを実行し、終了コード・stdout・stderr を返す。
 * 非 0 終了は reject されるが、呼び出し側は code で判定するため throw しない。
 */
export const run = async (
  cmd: string,
  args: string[],
  options?: { env?: NodeJS.ProcessEnv; input?: string },
): Promise<{ code: number; stdout: string; stderr: string }> => {
  const p = promisify(execFile)(cmd, args, { env: options?.env });
  if (options?.input !== undefined) {
    // EPIPE / ENOENT 等の stdin error は握りつぶす。終了コードと stderr は execFile 側の reject から取れる。
    p.child.stdin?.on("error", () => {});
    p.child.stdin?.end(options.input);
  }
  try {
    const { stdout, stderr } = await p;
    return { code: 0, stdout, stderr };
  } catch (e) {
    const err = e as { code?: unknown; stdout?: string; stderr?: string };
    return {
      code: typeof err.code === "number" ? err.code : 1,
      stdout: err.stdout ?? "",
      stderr: err.stderr ?? "",
    };
  }
};
