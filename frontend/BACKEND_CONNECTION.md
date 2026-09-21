# バックエンドへの接続

フロントエンドは React + TypeScript + Vite です。Python バックエンドは含みません。初期状態は同梱 JSON を使うデモモードです。

## 1. フロントエンドを起動

このファイルのある frontend ディレクトリで実行します。Node.js 22 推奨。

```sh
npm ci
cp .env.example .env
```

`.env` を次の内容にします。

```dotenv
VITE_DATA_SOURCE=api
VITE_API_BASE_URL=http://localhost:8000
```

```sh
npm run dev
```

通常は http://localhost:3000 です。ポート使用中は Vite が別のポートを使用するため、起動ログのURLを確認してください。この作業環境のプレビューは http://localhost:3001 です。

環境変数を変更したら開発サーバーを再起動します。画面右上が「APIモード」になれば切り替え完了です。

## 2. バックエンドに必要な2つのAPI

### GET /api/scenarios

ラッパーなしの JSON 配列を返してください。

```json
[
  {
    "id": "scenario-01",
    "title": "標的型メール攻撃対応シミュレーション",
    "subtitle": "初期対応と二次被害防止",
    "organization": "サンプル商事株式会社 情報システム部",
    "objective": "不審メール受信時の適切な初動対応を習得する"
  }
]
```

### GET /api/scenarios/{id}

指定IDのシナリオJSON全体を返してください。`src/data/scenario-01.json` がそのままレスポンスのサンプルです。型定義は `src/types/scenario.ts` を参照してください。

- 必須：`id`, `title`, `subtitle`, `organization`, `objective`, `startNode`, `nodes`, `endings`
- `nodes` はノードIDをキーにしたオブジェクトです。
- 各選択肢の `effect` は `rank`, `nextNode`, `tag`, `rationale`, `metrics` を持ちます。
- `rank` は `recommended`, `neutral`, `bad` のいずれか。
- `nextNode` は実在するノードID、エンディングID、または旧形式の `ending`。
- `endings` に `true`, `normal`, `bad` の各タイプを最低1件ずつ定義します。
- `recommendedRoute` は省略可能。IDの配列または `->` 区切り文字列を受け付けます。

詳細データは開始時に取得します。その後の選択、指標計算、結果判定はブラウザ内で行い、1手ごとのAPIは不要です。プレイ履歴を保存するAPIは呼びません。

## 3. CORS の設定

バックエンドでフロントエンドの実際のオリジンを許可してください。FastAPI を使用する場合、既存の `app` に次の設定を加えます。

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)
```

これは接続設定例であり、バックエンド本体の実装ではありません。`127.0.0.1` と `localhost` は別オリジンなので、使うURLに合わせてください。

## 4. 接続の確認

1. バックエンドをポート8000で起動する。
2. ブラウザで http://localhost:8000/api/scenarios を開き、配列が返ることを確認する。
3. フロントエンドでミッション選択を開く。
4. ブラウザの開発者ツールの Network で `/api/scenarios` が HTTP 200 になることを確認する。
5. シナリオを開始し、`/api/scenarios/scenario-01` が HTTP 200 になることを確認する。
6. プレイを進め、毎ターンの通信が発生しないことを確認する。

APIモードで失敗した場合はエラーを表示します。デモデータへの自動切り替えは行いません。通信は10秒でタイムアウトします。

## よくある問題

| 症状 | 確認すること |
| --- | --- |
| デモモードのまま | `.env` の保存先、`VITE_DATA_SOURCE=api`、Vite の再起動 |
| Failed to fetch / CORSエラー | APIの起動、接続URL、実際のフロントエンドのポートをCORSに追加 |
| HTTP 404 | `/api/scenarios` と `/api/scenarios/{id}` のパスが一致しているか |
| 一覧の形式エラー | `{ "scenarios": [...] }` ではなく配列を直接返しているか |
| シナリオ形式エラー | 必須項目、選択肢のランク、遷移先、3種類のエンディングがあるか |

## Docker・公開環境

フロントエンドだけを Docker で動かす場合：

```sh
docker compose up --build
```

`.env` の設定が compose 経由で Vite に渡されます。設定変更後はコンテナを再作成してください。

`VITE_API_BASE_URL` はブラウザからアクセスできるURLです。Docker内部の `http://backend:8000` ではなく、ローカルなら公開ポートの `http://localhost:8000` を指定します。スマートフォンなど別端末から試す場合、`localhost` はその端末自身を指すため、開発PCのIPアドレスを指定し、CORSも合わせます。

公開時は公開バックエンドのHTTPS URLを設定して `npm run build` を実行し、`dist/` を配信します。Viteの環境変数はビルド時に埋め込まれるため、接続先を変えたら再ビルドが必要です。公開フロントエンドのオリジンをバックエンドのCORSに追加してください。

`VITE_` で始まる値はブラウザに公開されます。APIキーなどの秘密情報は入れないでください。

## 検証範囲

デモモードでの画面操作、分岐、リトライ、レスポンシブ表示とビルドを確認済みです。実際のPythonバックエンドとの結合確認は、バックエンド起動後に上記手順で実施してください。

## このリポジトリのバックエンドについて

`../backend/` にFastAPIの実装があります。起動方法は `../backend/README.md` を参照してください。APIパスとレスポンスの型はフロントエンドの想定と一致しています。現在の `backend/app/main.py` のCORS許可は `http://localhost:3000` のみです。3001で起動する場合は、上の設定例に従って許可オリジンを追加してください。今回の追加ではバックエンド本体は変更していません。
