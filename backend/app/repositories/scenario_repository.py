from __future__ import annotations

import json
from pathlib import Path

from pydantic import ValidationError

from app.models.scenario import Scenario, ScenarioSummary


class ScenarioNotFoundError(Exception):
    pass


class ScenarioRepository:
    """静的 JSON シナリオを読み込むリポジトリ。DB は使用しない。"""

    def __init__(self, scenario_dir: Path) -> None:
        self.scenario_dir = scenario_dir

    def _load_file(self, path: Path) -> Scenario:
        try:
            raw = json.loads(path.read_text(encoding="utf-8"))
            return Scenario.model_validate(raw)
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid JSON: {path.name}") from exc
        except ValidationError as exc:
            raise ValueError(f"Invalid scenario schema: {path.name}") from exc

    def list_scenarios(self) -> list[ScenarioSummary]:
        summaries: list[ScenarioSummary] = []
        for path in sorted(self.scenario_dir.glob("*.json")):
            scenario = self._load_file(path)
            summaries.append(
                ScenarioSummary(
                    id=scenario.id,
                    title=scenario.title,
                    subtitle=scenario.subtitle,
                    organization=scenario.organization,
                    objective=scenario.objective,
                )
            )
        return summaries

    def get_scenario(self, scenario_id: str) -> Scenario:
        for path in sorted(self.scenario_dir.glob("*.json")):
            # ID はファイル名ではなく JSON 内の id を正とする。
            scenario = self._load_file(path)
            if scenario.id == scenario_id:
                return scenario
        raise ScenarioNotFoundError(scenario_id)
