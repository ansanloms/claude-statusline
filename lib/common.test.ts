import { expect, test } from "bun:test";
import { bgBlue, stripAnsiCode, white } from "@std/fmt/colors";
import { buildInlineProgressBar, formatCompact } from "./common.ts";

// --- formatCompact ---

test("formatCompact: 1000 未満はそのまま返す", () => {
  expect(formatCompact(999)).toEqual("999");
});

test("formatCompact: 1000 以上は K 表記にする", () => {
  expect(formatCompact(1000)).toEqual("1K");
});

test("formatCompact: 1500 は 1.5K になる", () => {
  expect(formatCompact(1500)).toEqual("1.5K");
});

test("formatCompact: 1000000 は 1M になる", () => {
  expect(formatCompact(1_000_000)).toEqual("1M");
});

// --- buildInlineProgressBar ---

test("buildInlineProgressBar: ANSI コードを除くと width ぶんの文字数になる", () => {
  expect(
    stripAnsiCode(buildInlineProgressBar(50, " label ", 20)).length,
  ).toEqual(20);
});

test("buildInlineProgressBar: ラベルが先頭に埋め込まれ残りは空白になる", () => {
  expect(stripAnsiCode(buildInlineProgressBar(50, "abc", 10))).toEqual(
    "abc" + " ".repeat(7),
  );
});

test("buildInlineProgressBar: ラベルが width を超える場合は末尾を ... で省略する", () => {
  expect(stripAnsiCode(buildInlineProgressBar(0, "0123456789ABC", 10))).toEqual(
    "0123456...",
  );
});

test("buildInlineProgressBar: width が ... に満たないときは省略記号なしで切り詰める", () => {
  expect(stripAnsiCode(buildInlineProgressBar(0, "0123456789", 3))).toEqual(
    "012",
  );
});

test("buildInlineProgressBar: ラベルが filled / unfilled の境界をまたいでも文字列が欠けない", () => {
  expect(stripAnsiCode(buildInlineProgressBar(50, "abcdefgh", 10))).toEqual(
    "abcdefgh" + " ".repeat(2),
  );
});

test("buildInlineProgressBar: 69% は緑背景", () => {
  const bar = buildInlineProgressBar(69, "x", 10);
  expect(bar.includes("\x1b[42m")).toBe(true);
  expect(bar.includes("\x1b[43m")).toBe(false);
  expect(bar.includes("\x1b[41m")).toBe(false);
});

test("buildInlineProgressBar: 70% は黄背景", () => {
  expect(buildInlineProgressBar(70, "x", 10).includes("\x1b[43m")).toBe(true);
});

test("buildInlineProgressBar: 90% は赤背景", () => {
  expect(buildInlineProgressBar(90, "x", 10).includes("\x1b[41m")).toBe(true);
});

test("buildInlineProgressBar: unfilled 領域は暗いグレー背景になる", () => {
  expect(buildInlineProgressBar(50, "x", 10).includes("\x1b[100m")).toBe(true);
});

test("buildInlineProgressBar: scheme.low で 70% 未満の色を差し替えられる", () => {
  const bar = buildInlineProgressBar(50, "x", 10, {
    low: (s) => bgBlue(white(s)),
  });
  expect(bar.includes("\x1b[44m")).toBe(true);
  expect(bar.includes("\x1b[42m")).toBe(false);
});

test("buildInlineProgressBar: scheme.low だけ指定しても 70% 以上は既定の黄背景になる", () => {
  const bar = buildInlineProgressBar(70, "x", 10, {
    low: (s) => bgBlue(white(s)),
  });
  expect(bar.includes("\x1b[43m")).toBe(true);
  expect(bar.includes("\x1b[44m")).toBe(false);
});

test("buildInlineProgressBar: scheme.low だけ指定しても 90% 以上は既定の赤背景になる", () => {
  const bar = buildInlineProgressBar(90, "x", 10, {
    low: (s) => bgBlue(white(s)),
  });
  expect(bar.includes("\x1b[41m")).toBe(true);
  expect(bar.includes("\x1b[44m")).toBe(false);
});
