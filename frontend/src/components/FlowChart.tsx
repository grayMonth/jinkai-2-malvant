import {ArrowDown,Check,GitBranch} from 'lucide-react';
import type {Scenario,GameState} from '../types/scenario';
import {MetricChanges} from './ParameterGauge';
export const rankLabels={recommended:'推奨される対応',neutral:'改善の余地あり',bad:'重大なリスク'};
export function FlowChart({scenario,state}:{scenario:Scenario;state:GameState}) {
 const route=typeof scenario.recommendedRoute==='string'?scenario.recommendedRoute.split('->').map(s=>s.trim()):scenario.recommendedRoute||[];
 return <><div className="route-banner"><GitBranch size={20}/><div><b>推奨ルート</b><p>{route.map(id=>scenario.nodes[id]?.title||scenario.endings[id]?.title||id).join(' → ')||'各ステップの推奨される対応をご確認ください。'}</p></div></div><div className="flow">{state.history.map((h,index)=>{const n=scenario.nodes[h.nodeId];return <div key={index} className="flow-step"><div className="flow-index">{String(index+1).padStart(2,'0')}</div><article className="panel"><div className="eyebrow">{n.phase}</div><h3>{n.title}</h3><div className="branches">{n.choices.map(c=><div key={c.id} className={`branch ${c.id===h.choice.id?'taken':''}`}><span className={`rank ${c.effect.rank}`}>{c.id===h.choice.id?<><Check size={13}/>あなたの選択 · </>:null}{rankLabels[c.effect.rank]}</span><p>{c.label}</p>{c.id===h.choice.id&&<><div className="rationale">{c.effect.rationale}</div><MetricChanges metrics={c.effect.metrics}/></>}</div>)}</div><details><summary>この時点の累積指標</summary><MetricChanges metrics={h.metrics}/></details></article><ArrowDown className="flow-arrow" size={20}/></div>})}<div className="flow-end">{state.ending?.title||'現在の状況へ続く'}</div></div></>;
}
