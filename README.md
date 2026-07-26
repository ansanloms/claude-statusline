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

`deno.json` の `version` を上げて main へマージしておきます。GitHub Actions の
Release workflow を手動実行（workflow_dispatch）すると、main の HEAD にタグ
`v<version>` を打ち、ビルドした `dist/claude-statusline` を添付した GitHub
Release を作成します。同名タグが既に存在する場合は失敗します。起動時のブランチ
には main を選んでください（main 以外を選ぶとジョブはスキップされ、何もせずに
成功扱いで終わります）。

## 実行要件

実行には [Deno](https://deno.com/) が PATH
上に必要です。`dist/claude-statusline` は単一の JavaScript ファイルで、shebang
から `deno run` を起動する形になっています。
