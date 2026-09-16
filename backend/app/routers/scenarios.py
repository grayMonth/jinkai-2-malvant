from fastapi import APIRouter, HTTPException, Request

from app.models.scenario import Scenario, ScenarioSummary
from app.repositories.scenario_repository import (
    ScenarioNotFoundError,
    ScenarioRepository,
)

router = APIRouter(prefix="/api/scenarios", tags=["scenarios"])


def get_repository(request: Request) -> ScenarioRepository:
    return request.app.state.scenario_repository


@router.get("", response_model=list[ScenarioSummary])
def list_scenarios(request: Request) -> list[ScenarioSummary]:
    return get_repository(request).list_scenarios()


@router.get("/{scenario_id}", response_model=Scenario)
def get_scenario(request: Request, scenario_id: str) -> Scenario:
    try:
        return get_repository(request).get_scenario(scenario_id)
    except ScenarioNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail=f"Scenario '{scenario_id}' not found",
        ) from exc
