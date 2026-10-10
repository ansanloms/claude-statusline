# claude-statusline

[Claude Code](https://code.claude.com/) の `statusLine` 用レンダラです。単一の
CLI `claude-statusline` にサブコマンド `main`（メインセッションの
statusline）を持ちます。

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

## 入力仕様

stdin に JSON が渡されます。フィールドの詳細は Claude Code
の公式ドキュメントを参照してください。

- https://code.claude.com/docs/en/statusline

## 開発

```sh
bun install      # 依存のインストール
bun run test     # テスト実行
bun run lint     # lint / フォーマットチェック
bun run check    # 型チェック
bun run build    # dist/claude-statusline へバンドル
bun run preview  # 全 fixture を一括描画して見た目を確認する
```

`bun.lock` はコミット対象です。`bun install --frozen-lockfile` で同じ依存を
再現できます。`dist/` は `.gitignore` 済みでコミットしません。

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
意図した表示変更をした場合は、次のコマンドでスナップショットを更新し、差分を
確認してからコミットしてください。

```sh
bun test --update-snapshots lib/snapshot.test.ts
```

## リリース

`package.json` の `version` を上げて main へマージしておきます。GitHub 上で release
を手動作成してください（タグ `v<version>` を main の HEAD で新規作成
します）。release の published をトリガに GitHub Actions がテスト・ビルドを
実行し、ビルドした `dist/claude-statusline` をその release に添付します。タグと
`package.json` の `version` が一致しない場合は workflow が失敗し、asset は
添付されません。workflow はタグのコミット時点のファイルで実行されるため、失敗
した場合は release とタグを削除し、修正を main へ取り込んでから作り直して
ください（run の再実行では回復しません）。

## 実行要件

実行には [Bun](https://bun.sh/) が PATH 上に必要です。`dist/claude-statusline`
は shebang から bun を起動する単一の JavaScript ファイルで、依存は inline
済みです。
