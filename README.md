# get-fgo-data

Fate/Grand Orderの、ダメージ計算に必要なサーヴァントデータを、[Atlas Academy API](https://api.atlasacademy.io/)から取得し、JSONファイルを更新するGitHub Actionです。

## 概要

このActionは、Atlas Academy APIから最新のFGOサーヴァントデータを取得し、指定されたJSONファイルに追加します。新しいサーヴァントが実装されるたびに、自動的にデータを更新できます。

## 使い方

### GitHub Actionsとして使用

```yaml
name: Update Servant Data JSON

on:
  workflow_dispatch:
  schedule:
    - cron: '0 0 * * *' # 毎日実行

jobs:
  update-json:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Run update script
        uses: zejba/get-fgo-data@master
        with:
          servantDataJSONPath:

      - name: Commit and push changes
      # 以下略
```

### Inputs

| 名前                  | 必須 | 説明                                         |
| --------------------- | ---- | -------------------------------------------- |
| `servantDataJSONPath` | ✓    | 更新するサーヴァントデータのJSONファイルパス |

## データ形式

出力されるJSONファイルの型定義は [`src/types/parsedServant.ts`](src/types/parsedServant.ts) にあります。

## データソース

サーヴァントデータは[Atlas Academy](https://atlasacademy.io/)のAPIを使用しています。
