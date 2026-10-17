// Dual-key autosave (ADR-0001 §2.2, Q14). A project that needs save format v3 is autosaved to tristancad.autosave.v3 as
// {savedAt, project, v2}; tristancad.autosave keeps the last v2-compatible state in its unchanged 2.x format, so a
// downgraded 2.x opens that instead of wiping v3 work. "v2" fingerprints tristancad.autosave as it was when the v3 record
// was written: on launch the v3 record is newer unless tristancad.autosave has changed since (only a 2.x build writes
// it while a v3 record exists). Architect ruling W0 round 2 (3): no work is lost silently. When a 2.x edit wins, the v3
// record stays as a backup (readAutosave reports v3Backup) and this session never removes it; it goes only when a newer
// 3.0 autosave replaces it, or when a session that opened it saves a v2-compatible project (the user removed the v3
// features in 3.0).
import {requiredVersion,forWrite} from './migrate.mjs';
export const AUTOSAVE='tristancad.autosave',AUTOSAVE_V3='tristancad.autosave.v3';
export const fingerprint=s=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return s.length+':'+(h>>>0).toString(16);};
// → {key, raw, value}: the autosave to open (value is the project JSON as stored, or null).
export function readAutosave(ls){
 let raw=null,value=null;try{raw=ls.getItem(AUTOSAVE);value=raw?JSON.parse(raw):null;}catch(e){console.warn(e);}
 try{const r3=ls.getItem(AUTOSAVE_V3),rec=r3?JSON.parse(r3):null;
  if(rec?.project&&rec.v2===fingerprint(raw||''))return {key:AUTOSAVE_V3,raw:JSON.stringify(rec.project),value:rec.project,v3Backup:false};
  if(rec?.project)return {key:AUTOSAVE,raw,value,v3Backup:true};}catch(e){console.warn(e);}
 return {key:AUTOSAVE,raw,value,v3Backup:false};}
// → {key, json}: what writeAutosave stores for this project (json is the exact stored string).
export function autosaveEntry(ls,project,now=Date.now()){
 if(requiredVersion(project)===2)return {key:AUTOSAVE,json:JSON.stringify(forWrite(project))};
 return {key:AUTOSAVE_V3,json:JSON.stringify({savedAt:now,project:forWrite(project),v2:fingerprint(ls.getItem(AUTOSAVE)||'')})};}
// keepV3: the session opened a 2.x autosave over a v3 record (v3Backup), so a v2-compatible write keeps that record.
export function writeAutosave(ls,project,now,keepV3=false){const e=autosaveEntry(ls,project,now);ls.setItem(e.key,e.json);if(e.key===AUTOSAVE&&!keepV3)ls.removeItem(AUTOSAVE_V3);return e;}
