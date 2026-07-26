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

`deno.json` の `version` を上げてから `v<version>` タグを push すると、GitHub
Actions がビルドした `dist/claude-statusline` を GitHub Release に添付します。

## 実行要件

実行には [Deno](https://deno.com/) が PATH
上に必要です。`dist/claude-statusline` は単一の JavaScript ファイルで、shebang
から `deno run` を起動する形になっています。
