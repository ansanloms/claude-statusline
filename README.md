# claude-statusline

[Claude Code](https://code.claude.com/) の `statusLine` 用レンダラです。単一の
CLI `claude-statusline` にサブコマンド `main`（メインセッションの
statusline）を持ちます。

## インストール

[Releases](https://github.com/ansanloms/claude-statusline/releases) から、自分の
OS / arch に合う asset をダウンロードします。

| OS      | arch  | asset                                 |
| ------- | ----- | ------------------------------------- |
| macOS   | x64   | `claude-statusline-darwin-x64`        |
| macOS   | arm64 | `claude-statusline-darwin-arm64`      |
| Linux   | x64   | `claude-statusline-linux-x64`         |
| Linux   | arm64 | `claude-statusline-linux-arm64`       |
| Windows | x64   | `claude-statusline-windows-x64.exe`   |
| Windows | arm64 | `claude-statusline-windows-arm64.exe` |

ダウンロードしたファイルを `claude-statusline`（Windows は
`claude-statusline.exe`）という名前で PATH 上に置きます。macOS / Linux では実行
権限も付けます。

```sh
chmod +x claude-statusline
```

macOS でブラウザからダウンロードした場合は quarantine 属性が付くため、
`xattr -d com.apple.quarantine claude-statusline` で外します。

asset は単体の実行ファイルで、依存は同梱済みです。runtime
のインストールは不要です。

## 使い方

`~/.claude/settings.json` に次のように設定します。

```json
{
  "statusLine": {
    "type": "command",
    "command": "claude-statusline main"
  }
}
```

`subagentStatusLine`（`claude-statusline sub`）は削除済みです。設定に残っている
場合は外してください。

## 入力仕様

stdin に JSON が渡されます。フィールドの詳細は Claude Code
の公式ドキュメントを参照してください。

- https://code.claude.com/docs/en/statusline

## 開発

```sh
bun install --frozen-lockfile  # 依存のインストール
bun run test                   # テスト実行
bun run lint                   # lint / フォーマットチェック
bun run check                  # 型チェック
bun run build                  # ホスト向けの単体実行ファイルを dist/claude-statusline へ出力
bun run build:release          # 6 target 分を dist/claude-statusline-<os>-<arch> へ出力
bun run preview                # 全 fixture を一括描画して見た目を確認する
```

開発に使う [Bun](https://bun.sh/) のバージョンは `.bun-version`（1.4.2）で固定
しています。`bun.lock` はコミット対象で、`--frozen-lockfile` で同じ依存を再現
できます。Bun の version を上げるときは `.bun-version` と `@types/bun` を揃えて
ください。`dist/` は `.gitignore` 済みでコミットしません。

依存の追加は `bunfig.toml` の設定に従い、exact version で、公開から 7 日未満の
version は解決しません（lifecycle script も実行しません）。CI では `bun audit`
を実行し、`bun.lock` の依存を npm の advisory に照会します。JSR 由来の依存
（`@gunshi/gunshi`、`@std/fmt`）は `npm.jsr.io` が audit に応答しないため、検査
対象外（skip）になります。

### fixture とプレビュー

`fixtures/main/*.json` に、`statusline main`
への入力サンプルを置いています。JSON 内の `{{PROJECT_DIR}}` はリポジトリルート
の絶対パスに置き換わるプレースホルダです（`lib/fixtures.ts` が読み込み時に置換
します）。`bun run preview` はこれらの fixture すべてを
エントリポイント (`statusline.ts`) 経由で実際に描画し、順番に表示します。表示
崩れの確認や新しい表示パターンの追加時に使ってください。

### スナップショットテスト

`lib/snapshot.test.ts` は上記 fixture を使い、`main` の stdout（ANSI
エスケープ込み）を `lib/__snapshots__/snapshot.test.ts.snap` と突き合わせます。
ローカルの `bun run test` は欠落しているスナップショットを自動生成します（CI
では失敗します）。新しい fixture を足したときは、生成されたスナップショットの
内容を確認してからコミットしてください。意図した表示変更をした場合は、次の
コマンドでスナップショットを更新し、差分を確認してからコミットしてください。

```sh
bun test --update-snapshots lib/snapshot.test.ts
```

## リリース

`package.json` の `version` を上げて main へマージしておきます。GitHub 上で release
を手動作成してください（タグ `v<version>` を main の HEAD で新規作成
します）。release の published をトリガに GitHub Actions がテスト・ビルドを
実行し、ビルドした 6 ファイル（`dist/claude-statusline-<os>-<arch>`、Windows は
`.exe` 付き）をその release に添付します。タグと
`package.json` の `version` が一致しない場合は workflow が失敗し、asset は
添付されません。workflow はタグのコミット時点のファイルで実行されるため、失敗
した場合は release とタグを削除し、修正を main へ取り込んでから作り直して
ください（run の再実行では回復しません）。
