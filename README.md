# claude-statusline

[Claude Code](https://code.claude.com/) の `statusLine` / `subagentStatusLine`
用レンダラです。単一の CLI `claude-statusline` にサブコマンド
`main`（メインセッションの statusline）と `sub`（agent panel の subagent
行）を持ちます。

## 使い方

`~/.claude/settings.json` に次のように設定します。

```json
{
  "statusLine": {
    "type": "command",
    "command": "claude-statusline main"
  },
  "subagentStatusLine": {
    "type": "command",
    "command": "claude-statusline sub"
  }
}
```

## 入力仕様

stdin に JSON が渡されます。フィールドの詳細は Claude Code
の公式ドキュメントを参照してください。

- https://code.claude.com/docs/en/statusline

## 開発

```sh
deno task test     # テスト実行
deno task lint     # lint / フォーマットチェック
deno task check    # 型チェック
deno task build    # dist/claude-statusline へバンドル
deno task preview  # 全 fixture を一括描画して見た目を確認する
```

`dist/` は `.gitignore` 済みでコミットしません。

### fixture とプレビュー

`fixtures/main/*.json` / `fixtures/sub/*.json` に、それぞれ `statusline main` /
`statusline sub` への入力サンプルを置いています。JSON 内の `{{PROJECT_DIR}}`
はリポジトリルートの絶対パスに置き換わるプレースホルダです（`lib/fixtures.ts`
が読み込み時に置換します）。`deno task preview` はこれらの fixture すべてを
エントリポイント (`statusline.ts`) 経由で実際に描画し、順番に表示します。表示
崩れの確認や新しい表示パターンの追加時に使ってください。

### スナップショットテスト

`lib/snapshot.test.ts` は上記 fixture を使い、各コマンドの stdout（ANSI
エスケープ込み）を `lib/__snapshots__/snapshot.test.ts.snap` と突き合わせます。
意図した表示変更をした場合は、次のコマンドでスナップショットを更新し、差分を
確認してからコミットしてください。

```sh
deno test -A lib/snapshot.test.ts -- --update
```

## リリース

`deno.json` の `version` を上げて main へマージしておきます。GitHub 上で release
を手動作成してください（タグ `v<version>` を main の HEAD で新規作成
します）。release の published をトリガに GitHub Actions がテスト・ビルドを
実行し、ビルドした `dist/claude-statusline` をその release に添付します。タグと
`deno.json` の `version` が一致しない場合は workflow が失敗し、asset は
添付されません。workflow はタグのコミット時点のファイルで実行されるため、失敗
した場合は release とタグを削除し、修正を main へ取り込んでから作り直して
ください（run の再実行では回復しません）。

## 実行要件

実行には [Deno](https://deno.com/) が PATH
上に必要です。`dist/claude-statusline` は単一の JavaScript ファイルで、shebang
から `deno run` を起動する形になっています。
