import assert from "node:assert/strict";
import { test } from "node:test";
import { run } from "./exec.ts";

test("run: exit 0 のコマンドは code 0 と stdout を返す", async () => {
  const r = await run(process.execPath, ["-e", "process.stdout.write('ok')"]);
  assert.deepEqual(r, { code: 0, stdout: "ok", stderr: "" });
});

test("run: 非 0 終了は throw せず code を返す", async () => {
  const r = await run(process.execPath, ["-e", "process.exit(3)"]);
  assert.equal(r.code, 3);
});

test("run: input を stdin へ渡す", async () => {
  const r = await run(
    process.execPath,
    ["-e", "process.stdin.pipe(process.stdout)"],
    { input: "hello" },
  );
  assert.equal(r.code, 0);
  assert.equal(r.stdout, "hello");
});

test("run: 存在しないコマンドに input を渡しても throw せず非 0 を返す", async () => {
  const r = await run("/nonexistent/cmd", [], { input: "x" });
  assert.equal(typeof r.code, "number");
  assert.notEqual(r.code, 0);
});
