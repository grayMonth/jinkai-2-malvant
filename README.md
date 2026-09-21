# jinkai-2-malvant
This is the repository setup.

## フロントエンド

企業のセキュリティ対応担当者として行動を選ぶ、React + TypeScript のロールプレイ型シミュレーションです。

```sh
cd frontend
npm ci
npm run dev
```

初期設定はバックエンド不要のデモモードです。

- [フロントエンドの説明](frontend/README.md)
- [バックエンドへの接続手順](frontend/BACKEND_CONNECTION.md)
- [バックエンドの説明](backend/README.md)

APIに接続する場合は `frontend/.env.example` を `frontend/.env` にコピーして `VITE_DATA_SOURCE=api` に変更し、バックエンドをポート8000で起動してください。現在のバックエンドのCORS許可は `http://localhost:3000` のみです。フロントエンドを別ポートで起動する場合はCORS設定も合わせてください。
