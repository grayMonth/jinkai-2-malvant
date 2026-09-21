export type MetricKey = 'containment' | 'service' | 'trust' | 'fatigue';
export type Metrics = Record<MetricKey, number>;
export type ChoiceRank = 'recommended' | 'bad' | 'neutral';
export type EndingType = 'true' | 'normal' | 'bad';
export interface Evidence {label:string;value:string;tone:'danger'|'warning'|'ok'|'neutral'}
export interface Choice {id:string;label:string;description:string;effect:{rank:ChoiceRank;nextNode:string;tag:string;rationale:string;metrics:Partial<Metrics>}}
export interface ScenarioNode {id:string;phase:string;eyebrow:string;title:string;body:string[];alert:string;evidence:Evidence[];choices:Choice[]}
export interface Ending {id:string;type:EndingType;title:string;summary:string}
export interface ScenarioSummary {id:string;title:string;subtitle:string;organization:string;objective?:string}
export interface Scenario extends ScenarioSummary {objective:string;startNode:string;recommendedRoute?:string|string[];nodes:Record<string,ScenarioNode>;endings:Record<string,Ending>}
export interface HistoryEntry {nodeId:string;choice:Choice;metrics:Metrics}
export interface GameState {nodeId:string;metrics:Metrics;history:HistoryEntry[];ending:Ending|null}
