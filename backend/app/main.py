from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.repositories.scenario_repository import ScenarioRepository
from app.routers.scenarios import router as scenarios_router

BASE_DIR = Path(__file__).resolve().parent.parent
SCENARIO_DIR = BASE_DIR / "data" / "scenarios"

app = FastAPI(
    title="Security Education Defense Simulation Game API",
    version="0.1.0",
    description="静的 JSON シナリオを配信するバックエンド API",
)

# 要件定義書の開発環境: React localhost:3000 -> Python localhost:8000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.state.scenario_repository = ScenarioRepository(SCENARIO_DIR)
app.include_router(scenarios_router)


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok"}
