import assert from "node:assert/strict";
import { test } from "node:test";
import { bgBlue, stripAnsiCode, white } from "@std/fmt/colors";
import { buildInlineProgressBar, formatCompact } from "./common.ts";

// --- formatCompact ---

test("formatCompact: 1000 未満はそのまま返す", () => {
  assert.deepStrictEqual(formatCompact(999), "999");
});

test("formatCompact: 1000 以上は K 表記にする", () => {
  assert.deepStrictEqual(formatCompact(1000), "1K");
});

test("formatCompact: 1500 は 1.5K になる", () => {
  assert.deepStrictEqual(formatCompact(1500), "1.5K");
});

test("formatCompact: 1000000 は 1M になる", () => {
  assert.deepStrictEqual(formatCompact(1_000_000), "1M");
});

// --- buildInlineProgressBar ---

test("buildInlineProgressBar: ANSI コードを除くと width ぶんの文字数になる", () => {
  assert.deepStrictEqual(
    stripAnsiCode(buildInlineProgressBar(50, " label ", 20)).length,
    20,
  );
});

test("buildInlineProgressBar: ラベルが先頭に埋め込まれ残りは空白になる", () => {
  assert.deepStrictEqual(
    stripAnsiCode(buildInlineProgressBar(50, "abc", 10)),
    "abc" + " ".repeat(7),
  );
});

test("buildInlineProgressBar: ラベルが width を超える場合は末尾を ... で省略する", () => {
  assert.deepStrictEqual(
    stripAnsiCode(buildInlineProgressBar(0, "0123456789ABC", 10)),
    "0123456...",
  );
});

test("buildInlineProgressBar: width が ... に満たないときは省略記号なしで切り詰める", () => {
  assert.deepStrictEqual(
    stripAnsiCode(buildInlineProgressBar(0, "0123456789", 3)),
    "012",
  );
});

test("buildInlineProgressBar: ラベルが filled / unfilled の境界をまたいでも文字列が欠けない", () => {
  assert.deepStrictEqual(
    stripAnsiCode(buildInlineProgressBar(50, "abcdefgh", 10)),
    "abcdefgh" + " ".repeat(2),
  );
});

test("buildInlineProgressBar: 69% は緑背景", () => {
  const bar = buildInlineProgressBar(69, "x", 10);
  assert.ok(bar.includes("\x1b[42m"));
  assert.ok(!bar.includes("\x1b[43m"));
  assert.ok(!bar.includes("\x1b[41m"));
});

test("buildInlineProgressBar: 70% は黄背景", () => {
  assert.ok(buildInlineProgressBar(70, "x", 10).includes("\x1b[43m"));
});

test("buildInlineProgressBar: 90% は赤背景", () => {
  assert.ok(buildInlineProgressBar(90, "x", 10).includes("\x1b[41m"));
});

test("buildInlineProgressBar: unfilled 領域は暗いグレー背景になる", () => {
  assert.ok(buildInlineProgressBar(50, "x", 10).includes("\x1b[100m"));
});

test("buildInlineProgressBar: scheme.low で 70% 未満の色を差し替えられる", () => {
  const bar = buildInlineProgressBar(50, "x", 10, {
    low: (s) => bgBlue(white(s)),
  });
  assert.ok(bar.includes("\x1b[44m"));
  assert.ok(!bar.includes("\x1b[42m"));
});

test("buildInlineProgressBar: scheme.low だけ指定しても 70% 以上は既定の黄背景になる", () => {
  const bar = buildInlineProgressBar(70, "x", 10, {
    low: (s) => bgBlue(white(s)),
  });
  assert.ok(bar.includes("\x1b[43m"));
  assert.ok(!bar.includes("\x1b[44m"));
});

test("buildInlineProgressBar: scheme.low だけ指定しても 90% 以上は既定の赤背景になる", () => {
  const bar = buildInlineProgressBar(90, "x", 10, {
    low: (s) => bgBlue(white(s)),
  });
  assert.ok(bar.includes("\x1b[41m"));
  assert.ok(!bar.includes("\x1b[44m"));
});
