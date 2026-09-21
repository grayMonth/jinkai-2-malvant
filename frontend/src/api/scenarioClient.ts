import first from '../data/scenario-01.json';
import second from '../data/scenario-02.json';
import {validateScenario} from '../state/game';
import type {ScenarioSummary} from '../types/scenario';
const local=[first,second];
export const apiMode=import.meta.env.VITE_DATA_SOURCE==='api';
async function request(path:string):Promise<unknown>{
 const response=await fetch(`${(import.meta.env.VITE_API_BASE_URL||'http://localhost:8000').replace(/\/$/,'')}${path}`,{signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new Error(`シナリオを取得できませんでした（HTTP ${response.status}）。`);
 return response.json();
}
export async function getScenarios():Promise<ScenarioSummary[]>{
 const data=apiMode?await request('/api/scenarios'):local;
 if(!Array.isArray(data)||data.some(s=>!s||typeof s.id!=='string'||typeof s.title!=='string'))throw new Error('シナリオ一覧の形式が正しくありません。');
 return data;
}
export async function getScenario(id:string){return validateScenario(apiMode?await request(`/api/scenarios/${encodeURIComponent(id)}`):local.find(s=>s.id===id));}
