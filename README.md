<div id="top"></div>

## 使用技術一覧

<!-- シールド一覧 -->
<!-- 該当するプロジェクトの中から任意のものを選ぶ-->
<p style="display: inline">
  <!-- フロントエンドのフレームワーク一覧 -->
  <img src="https://img.shields.io/badge/-Node.js-000000.svg?logo=node.js&style=for-the-badge">
</p>

## 目次

1. [プロジェクトについて](#プロジェクトについて)
2. [環境](#環境)
3. [ディレクトリ構成](#ディレクトリ構成)
4. [開発環境構築](#開発環境構築)

## プロジェクト名

Google認証におけるOAuth2.0の認可コードフローをNode.jsで実装

<!-- プロジェクトについて -->

## プロジェクトについて

Google認証におけるOAuth2.0の認可コードフローをNode.jsで実装
OAuth2.0の勉強が目的のためOAuthライブラリは使わずに実装しました。

## 環境

<!-- 言語、フレームワーク、ミドルウェア、インフラの一覧とバージョンを記載 -->

| 言語・フレームワーク  | バージョン |
| --------------------- | ---------- |
| Node.js               | 18.19.0    |

その他のパッケージのバージョンは package.json を参照してください

## ディレクトリ構成

<!-- Treeコマンドを使ってディレクトリ構成を記載 -->

❯ tree -a -I "node_modules|.next|.git|.pytest_cache|static" -L 2
```
.
├── .eslintrc
├── .gitignore
├── README.md
├── index.js
├── package-lock.json
├── package.json
├── requestHandlers.js
├── router.js
└── server.js
```

<p align="right">(<a href="#top">トップへ</a>)</p>

## 開発環境構築

<!-- コンテナの作成方法、パッケージのインストール方法など、開発環境構築に必要な情報を記載 -->
### モジュールのインストール
```
npm install
```
### シークレット情報の設定
requestHandlers.jsの下記定数に、GoogleのクライアントIDおよびシークレットを設定

`const client_id = "クライアントID"`
`const client_secret = "シークレットID"`

### 承認済みリダイレクトURIの設定
Googleコンソール画面のクライアントID登録画面の承認済みのリダイレクトURI情報に書きを登録

`http://localhost:8080/callback`

### サーバ起動
```
npm run start
```

### 動作確認

http://localhost:8080 にアクセスできるか確認
アクセスできたら成功


<p align="right">(<a href="#top">トップへ</a>)</p>
