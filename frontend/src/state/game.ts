import type {Scenario,GameState,EndingType,ChoiceRank} from '../types/scenario';
export const initialState=(s:Scenario):GameState=>({nodeId:s.startNode,metrics:{containment:0,service:0,trust:0,fatigue:0},history:[],ending:null});
export function evaluateEnding(ranks:ChoiceRank[]):EndingType {return ranks.includes('bad')?'bad':ranks.length>0&&ranks.every(r=>r==='recommended')?'true':'normal'}
export function choose(s:Scenario,state:GameState,choiceId:string):GameState {
 if(state.ending)return state;
 const choice=s.nodes[state.nodeId]?.choices.find(c=>c.id===choiceId);
 if(!choice)throw new Error('選択肢が見つかりません。');
 const metrics={...state.metrics};
 for(const key of Object.keys(metrics) as (keyof typeof metrics)[]) metrics[key]+=choice.effect.metrics[key]??0;
 const history=[...state.history,{nodeId:state.nodeId,choice,metrics:{...metrics}}];
 const next=choice.effect.nextNode;
 if(choice.effect.rank==='bad'||next==='ending'||s.endings[next]) {
  const type=evaluateEnding(history.map(h=>h.choice.effect.rank));
  const ending=s.endings[next]?.type===type?s.endings[next]:Object.values(s.endings).find(e=>e.type===type);
  if(!ending)throw new Error(`${type} のエンディングが定義されていません。`);
  return {...state,metrics,history,ending};
 }
 if(!s.nodes[next])throw new Error('遷移先が見つかりません。');
 return {nodeId:next,metrics,history,ending:null};
}
export function validateScenario(input:unknown):Scenario {
 const s=input as Scenario;
 if(!s||typeof s.id!=='string'||typeof s.title!=='string'||!s.nodes||!s.nodes[s.startNode]||!s.endings)throw new Error('シナリオ形式が正しくありません。');
 if(['subtitle','organization','objective'].some(k=>typeof (s as unknown as Record<string,unknown>)[k]!=='string'))throw new Error('シナリオ概要の形式が正しくありません。');
 if(s.recommendedRoute!==undefined&&typeof s.recommendedRoute!=='string'&&(!Array.isArray(s.recommendedRoute)||!s.recommendedRoute.every(id=>typeof id==='string')))throw new Error('推奨ルートの形式が正しくありません。');
 for(const type of ['true','normal','bad'])if(!Object.values(s.endings).some(e=>e.type===type&&typeof e.title==='string'&&typeof e.summary==='string'))throw new Error('3種類のエンディングが必要です。');
 for(const node of Object.values(s.nodes)) {
  if(!node||typeof node.title!=='string'||!Array.isArray(node.body)||!node.body.every(t=>typeof t==='string')||!Array.isArray(node.evidence)||!Array.isArray(node.choices)||!node.choices.length)throw new Error('ノード形式が正しくありません。');
  if(['phase','eyebrow','alert'].some(k=>typeof (node as unknown as Record<string,unknown>)[k]!=='string')||node.evidence.some(e=>!e||typeof e.label!=='string'||typeof e.value!=='string'||!['danger','warning','ok','neutral'].includes(e.tone)))throw new Error('状況説明の形式が正しくありません。');
  if(new Set(node.choices.map(c=>c.id)).size!==node.choices.length)throw new Error('選択肢IDが重複しています。');
  for(const c of node.choices){
   if(!c.effect||typeof c.id!=='string'||typeof c.label!=='string'||typeof c.description!=='string'||typeof c.effect.rationale!=='string'||typeof c.effect.tag!=='string'||!['recommended','neutral','bad'].includes(c.effect.rank)||!c.effect.metrics)throw new Error('選択肢形式が正しくありません。');
   if(c.effect.nextNode!=='ending'&&!s.nodes[c.effect.nextNode]&&!s.endings[c.effect.nextNode])throw new Error('未定義の遷移先があります。');
   if(Object.values(c.effect.metrics).some(v=>typeof v!=='number'||!Number.isFinite(v)))throw new Error('指標には有限の数値を指定してください。');
  }
 }
 return s;
}
