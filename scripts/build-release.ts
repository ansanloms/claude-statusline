const targets = [
  "darwin-x64",
  "darwin-arm64",
  "linux-x64",
  "linux-arm64",
  "windows-x64",
  "windows-arm64",
];

const flags = [
  "--compile",
  "--no-compile-autoload-bunfig",
  "--no-compile-autoload-dotenv",
];

// 引数 host: 実行環境向けに dist/claude-statusline を 1 本だけ作る。
// 引数無し: 全 target の asset を作る。
const jobs =
  process.argv[2] === "host"
    ? [{ label: "host", args: [], outfile: "dist/claude-statusline" }]
    : targets.map((target) => {
        const ext = target.startsWith("windows-") ? ".exe" : "";
        return {
          label: target,
          args: [`--target=bun-${target}`],
          outfile: `dist/claude-statusline-${target}${ext}`,
        };
      });

for (const job of jobs) {
  const proc = Bun.spawn(
    [
      "bun",
      "build",
      ...flags,
      ...job.args,
      "--outfile",
      job.outfile,
      "statusline.ts",
    ],
    { stdout: "inherit", stderr: "inherit" },
  );
  const code = await proc.exited;
  if (code !== 0) {
    console.error(`build failed: ${job.label} (exit ${code})`);
    process.exit(code);
  }
}
