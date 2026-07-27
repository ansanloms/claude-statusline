import {
  bgBrightBlack,
  bgGreen,
  bgRed,
  bgYellow,
  black,
  white,
} from "@std/fmt/colors";

/**
 * stdin から JSON を読み取り、指定した型として返す。
 */
export const getInput = async <T>(): Promise<T> => {
  const decoder = new TextDecoder();
  let input = "";
  for await (const chunk of Deno.stdin.readable) {
    input += decoder.decode(chunk);
  }

  return JSON.parse(input) as T;
};

/**
 * 数値を compact 表記（例: 1K, 2.3M）にフォーマットする。
 */
export const formatCompact = (num: number): string =>
  new Intl.NumberFormat("en", {
    notation: "compact",
    compactDisplay: "short",
  }).format(num);

/**
 * インラインプログレスバーの色スキーム。
 * 各閾値帯の filled 領域を塗る関数を指定する。
 */
export interface ProgressBarColorScheme {
  /** 70% 未満の filled 領域の塗り。 */
  low: (s: string) => string;

  /** 70% 以上 90% 未満の filled 領域の塗り。 */
  mid: (s: string) => string;

  /** 90% 以上の filled 領域の塗り。 */
  high: (s: string) => string;
}

const defaultProgressBarColorScheme: ProgressBarColorScheme = {
  low: (s) => bgGreen(black(s)),
  mid: (s) => bgYellow(black(s)),
  high: (s) => bgRed(white(s)),
};

/**
 * ラベルをバー内に埋め込んだ背景色付きプログレスバーを返す。
 * filled 領域と unfilled 領域で背景色を分け、ラベルが境界をまたぐ場合は
 * それぞれの背景色を適用する。
 * filled の色は scheme で差し替えられる。既定では
 * 90% 以上: 赤背景、70% 以上: 黄背景、それ以外: 緑背景。
 * unfilled 領域は暗いグレー背景。
 */
export const buildInlineProgressBar = (
  pct: number,
  label: string,
  width: number,
  scheme: Partial<ProgressBarColorScheme> = {},
): string => {
  const filled = Math.floor(pct * width / 100);
  // ラベルが width を超える場合は末尾を "..." で省略する。
  // width が "..." 自体に満たないほど狭いときは省略記号を付けず素朴に切り詰める。
  const ellipsis = "...";
  const clipped = label.length > width
    ? width > ellipsis.length
      ? label.slice(0, width - ellipsis.length) + ellipsis
      : label.slice(0, Math.max(0, width))
    : label;
  const splitAt = Math.min(filled, clipped.length);

  const labelFilled = clipped.slice(0, splitAt);
  const labelUnfilled = clipped.slice(splitAt);
  const filledRemainder = " ".repeat(Math.max(0, filled - clipped.length));
  const unfilledRemainder = " ".repeat(
    Math.max(0, width - Math.max(filled, clipped.length)),
  );

  const filledStr = labelFilled + filledRemainder;
  const unfilledStr = labelUnfilled + unfilledRemainder;

  const paint = pct >= 90
    ? (scheme.high ?? defaultProgressBarColorScheme.high)
    : pct >= 70
    ? (scheme.mid ?? defaultProgressBarColorScheme.mid)
    : (scheme.low ?? defaultProgressBarColorScheme.low);

  return paint(filledStr) + bgBrightBlack(white(unfilledStr));
};
