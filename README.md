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
deno task test    # テスト実行
deno task lint    # lint / フォーマットチェック
deno task check   # 型チェック
deno task build   # dist/claude-statusline へバンドル
```

`dist/` は `.gitignore` 済みでコミットしません。

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
