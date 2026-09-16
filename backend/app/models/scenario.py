from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


Tone = Literal["danger", "warning", "ok", "neutral"]
MetricKey = Literal["containment", "service", "trust", "fatigue"]
ChoiceRank = Literal["recommended", "bad", "neutral"]


class Evidence(BaseModel):
    model_config = ConfigDict(extra="forbid")

    label: str
    value: str
    tone: Tone


class ChoiceEffect(BaseModel):
    model_config = ConfigDict(extra="forbid")

    metrics: dict[MetricKey, int] = Field(default_factory=dict)
    nextNode: str
    tag: str
    rationale: str
    rank: ChoiceRank


class Choice(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    label: str
    description: str
    effect: ChoiceEffect


class ScenarioNode(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    phase: str
    eyebrow: str
    title: str
    body: list[str]
    alert: str
    evidence: list[Evidence]
    choices: list[Choice]


class Ending(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    type: Literal["true", "normal", "bad"]
    title: str
    summary: str


class Scenario(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    title: str
    subtitle: str
    organization: str
    objective: str
    startNode: str
    recommendedRoute: str | None = None
    nodes: dict[str, ScenarioNode]
    endings: dict[str, Ending]


class ScenarioSummary(BaseModel):
    """一覧 API 用。詳細ノードは含めない。"""

    model_config = ConfigDict(extra="forbid")

    id: str
    title: str
    subtitle: str
    organization: str
    objective: str
