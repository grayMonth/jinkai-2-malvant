# SECURE SHIFT フロントエンド

セキュリティ教育用防御シミュレーションゲーム。React + TypeScript + Vite で作成したフロントエンドのみの実装です。Python サーバー、DB、ログイン機能は含みません。

プレイヤーは企業の情報システム部のセキュリティ対応担当者として、社員からの報告やログを確認し、対応を選ぶロールプレイです。独立したプレイガイド画面は設けず、最初のページに任務・操作方法・4指標・エンディングの説明をまとめています。

詳しいAPI接続手順は [BACKEND_CONNECTION.md](BACKEND_CONNECTION.md) を参照してください。

## 起動

Node.js 22 推奨。

```sh
cd frontend
npm ci
npm run dev
```

ブラウザで http://localhost:3000 を開きます。初期設定はデモモードです。バックエンドなしで2本のシナリオをプレイできます。

```sh
npm run build    # 型検査 + 本番ビルド（dist/）
npm test         # 分岐・集計・入力検証のテスト
npm run preview # ビルド済み画面の確認
```

Docker を使用する場合は frontend ディレクトリで `docker compose up --build`。フロントエンド単独で起動します。

## 実装した画面・機能

- トップ（役割・物語の導入・遊び方）、シナリオ選択、状況説明と対応の選択、結果・総評、分岐の振り返り
- 4指標の累積値とゲージ、危険度別のエビデンス、選択の解説
- 実際に選んだ枝・未選択の枝・推奨ルートの比較
- リトライ、ハンバーガーメニュー、途中のプレイへ戻る機能
- PC・スマートフォン対応、キーボードでの選択、ラジオボタン、フォーカス表示
- API の読み込み中・エラー・再読み込み・空一覧表示

プレイ状態はメモリだけに保持し、再読み込みで消えます。別シナリオを開始すると履歴も初期化します。

## バックエンドへの接続

`.env.example` を `.env` にコピーし、設定後に開発サーバーを再起動します。

```dotenv
VITE_DATA_SOURCE=api
VITE_API_BASE_URL=http://localhost:8000
```

API モードで接続に失敗した場合はエラー表示します。デモデータへの自動フォールバックはありません。

| Method | Path | 戻り値 |
| --- | --- | --- |
| GET | /api/scenarios | ScenarioSummary の配列（ラッパーなし） |
| GET | /api/scenarios/{id} | Scenario オブジェクト |

詳細は `src/types/scenario.ts`。一覧には `id`, `title`, `subtitle`, `organization`、詳細には `objective`, `startNode`, `nodes`, `endings` が必要です。詳細取得は開始時の1回のみで、各選択時の通信は行いません。API 側でフロントエンドのオリジン（開発時 http://localhost:3000）に対する CORS を許可してください。環境変数はブラウザから参照可能なので秘密情報を入れないでください。

## 資料との差分・採用ルール

新しいクラス図と提供された JSON を優先しています。

1. `bad` を選ぶと即時 Bad End。
2. 終端に到達し、全選択が `recommended` なら True End。
3. それ以外は Normal End。

4指標は初期値0で加減算し、判定には使いません。値は丸めず保持し、ゲージ表示だけ ±100 までとします。±100 は視覚表現上の範囲で、成績の閾値ではありません。サービス影響度の増減も JSON の値をそのまま反映します。

`nextNode` はノードID・エンディングID・旧設計の `ending` に対応します。選択履歴から求めた結果タイプを優先し、指定エンディングのタイプが違う場合は同じタイプのエンディングを使用します。このため、提供JSONの「neutral → node_02 → ending_true」でも正しく Normal End になります。各タイプのエンディングを最低1つ定義してください。

`recommendedRoute` はクラス図の文字列配列と、提供JSONの `->` 区切り文字列の両方に対応します。

- `src/data/scenario-01.json`：提供された JSON をそのまま同梱。
- `src/data/scenario-02.json`：追加したランサムウェア対応のデモ教材。正式なシナリオ担当者による内容確認を想定しています。

提供JSONの node_02 の文章は「端末の切り離しを指示した後」となっていますが、neutral の選択でも遷移します。元資料は維持しているため、正式シナリオでは本文の一般化または専用ノードへの分岐が必要です。

## 構成

```text
src/
  api/scenarioClient.ts       デモ/API の切り替え、取得処理
  types/scenario.ts          共通型
  state/game.ts             純粋関数による進行・判定・検証
  state/game.test.ts        進行ロジックのテスト
  components/
    ParameterGauge.tsx      4指標・増減表示
    FlowChart.tsx           選択枝と推奨枝の比較
  data/                     デモ用 JSON
  main.tsx                  各画面とナビゲーション
  style.css                 レスポンシブスタイル
```

シナリオ本文は React のテキストとして表示し、生のHTMLは挿入しません。APIからのデータは読み込み時に構造と遷移先を検証します。デモ用JSONの追加は `src/api/scenarioClient.ts` への登録が必要です。APIモードでは、サーバーが一覧を返せばフロントの修正なしでシナリオが増やせます。
