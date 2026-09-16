# セキュリティ教育用防御シミュレーションゲーム - Backend

要件定義書 v0.3、内部設計書 v0.3、クラス図、および提供された `scenario_template.json` を基準にした Python/FastAPI バックエンドです。

## 1. バックエンドの責務

- JSON 静的シナリオの読み込み
- シナリオ一覧の配信
- シナリオ詳細（全ノード・選択肢・エンディング）の配信
- Pydantic による API レスポンス/シナリオ構造の検証
- React (`http://localhost:3000`) からの GET を許可する CORS
- DB を使用しない
- プレイ中のノード遷移・メトリクス計算・選択履歴管理は行わない

## 2. API

### GET `/api/scenarios`

シナリオ一覧を返します。

### GET `/api/scenarios/{scenario_id}`

指定 ID のシナリオ詳細を返します。

### GET `/health`

サーバーの簡易ヘルスチェックです。

## 3. 起動

### Python で起動

```bash
python -m venv .venv
# Windows:
.venv\\Scripts\\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

ブラウザ:
- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs

### Docker

```bash
docker compose up --build
```

## 4. テスト

```bash
pytest -q
```

## 5. シナリオ追加

`data/scenarios/` に JSON ファイルを追加してください。

ファイル名ではなく JSON 内の `id` をシナリオ ID として扱います。

最低限、現在のモデルでは以下を持ちます。

- Scenario
- ScenarioNode
- Choice
- ChoiceEffect
- Evidence
- Ending

`ChoiceEffect.rank` は `recommended / bad / neutral` のいずれかです。

## 6. エンディング判定について

エンディング判定は本バックエンドでは実施しません。

クラス図・内部設計に従い、詳細取得後はフロントエンドの `GameState` が選択履歴を管理し、`rank` を集計して判定します。

ルール:
1. `bad` が1つでもあれば Bad End
2. 全選択が `recommended` なら True End
3. それ以外は Normal End

## 7. ディレクトリ

```text
backend/
├── app/
│   ├── main.py
│   ├── models/
│   │   └── scenario.py
│   ├── repositories/
│   │   └── scenario_repository.py
│   └── routers/
│       └── scenarios.py
├── data/
│   └── scenarios/
│       └── scenario-01.json
├── tests/
│   ├── conftest.py
│   └── test_scenarios.py
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
```
