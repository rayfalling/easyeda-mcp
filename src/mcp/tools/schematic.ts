import { executeCode } from "../../bridge/server.js";
import { parseExecuteResult } from "../../codegen/builder.js";
import { generateSchPlaceComponent } from "../../codegen/schematic.js";

export async function handleSchPlaceComponent(params: {
  lx: number; ly: number; libraryUuid: string;
  rotation?: number; flip?: boolean;
}): Promise<string> {
  const code = generateSchPlaceComponent(params);
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleSchPlaceWire(params: {
  x1: number; y1: number; x2: number; y2: number; net?: string;
}): Promise<string> {
  const code = `(async()=>{try{const r=await eda.sch_PrimitiveWire.create([${params.x1},${params.y1},${params.x2},${params.y2}],${params.net?`"${params.net}"`:"undefined"});return JSON.stringify({ok:true,value:{id:r?.primitiveId}});}catch(e){return JSON.stringify({ok:false,error:e?.message??String(e)});}})()`;
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleSchPlaceNetlabel(params: {
  lx: number; ly: number; netName: string; rotation?: number;
}): Promise<string> {
  const code = `(async()=>{try{const r=await eda.sch_PrimitiveText.create(${params.lx},${params.ly},"${params.netName}",${params.rotation??0});return JSON.stringify({ok:true,value:{id:r?.primitiveId}});}catch(e){return JSON.stringify({ok:false,error:e?.message??String(e)});}})()`;
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleSchPlaceText(params: {
  lx: number; ly: number; text: string; rotation?: number; height?: number;
}): Promise<string> {
  const code = `(async()=>{try{const r=await eda.sch_PrimitiveText.create(${params.lx},${params.ly},"${params.text}",${params.rotation??0},null,null,${params.height??60});return JSON.stringify({ok:true,value:{id:r?.primitiveId}});}catch(e){return JSON.stringify({ok:false,error:e?.message??String(e)});}})()`;
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleSchSelect(params: { lx: number; ly: number }): Promise<string> {
  const code = `(async()=>{try{await eda.sch_SelectControl.clearSelected();const mods=[eda.sch_PrimitiveComponent,eda.sch_PrimitiveWire,eda.sch_PrimitiveText];let best=null,bd=1e9;for(const m of mods){try{const all=await m.getAll();for(const p of all){const dx=(p.x||p.lx||0)-${params.lx};const dy=(p.y||p.ly||0)-${params.ly};const d=dx*dx+dy*dy;if(d<bd){bd=d;best=p;}}}catch(e){}}if(best)await eda.sch_SelectControl.doSelectPrimitives([best]);return JSON.stringify({ok:true,value:{selected:!!best}});}catch(e){return JSON.stringify({ok:false,error:e?.message??String(e)});}})()`;
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleSchGetSelected(): Promise<string> {
  const code = `(async()=>{try{const s=await eda.sch_SelectControl.getSelectedPrimitives();return JSON.stringify({ok:true,value:s.map(x=>({id:x.primitiveId,type:x.primitiveType}))});}catch(e){return JSON.stringify({ok:false,error:e?.message??String(e)});}})()`;
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleSchDeleteSelected(): Promise<string> {
  const code = `(async()=>{try{const s=await eda.sch_SelectControl.getSelectedPrimitives();let d=0;for(const x of s){try{const t=x.primitiveType;if(t==='Component')await eda.sch_PrimitiveComponent.delete(x.primitiveId);else if(t==='Wire')await eda.sch_PrimitiveWire.delete(x.primitiveId);else if(t==='Text')await eda.sch_PrimitiveText.delete(x.primitiveId);d++;}catch(e){}}await eda.sch_SelectControl.clearSelected();return JSON.stringify({ok:true,value:{deleted:d}});}catch(e){return JSON.stringify({ok:false,error:e?.message??String(e)});}})()`;
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleSchMove(params: { dx: number; dy: number }): Promise<string> {
  const code = `(async()=>{try{const s=await eda.sch_SelectControl.getSelectedPrimitives();let m=0;for(const x of s){try{const nx=(x.x||x.lx||0)+${params.dx};const ny=(x.y||x.ly||0)+${params.dy};const t=x.primitiveType;if(t==='Component')await eda.sch_PrimitiveComponent.modify(x.primitiveId,{x:nx,y:ny});else if(t==='Wire')await eda.sch_PrimitiveWire.modify(x.primitiveId,{line:[]});else if(t==='Text')await eda.sch_PrimitiveText.modify(x.primitiveId,{x:nx,y:ny});m++;}catch(e){}}return JSON.stringify({ok:true,value:{moved:m}});}catch(e){return JSON.stringify({ok:false,error:e?.message??String(e)});}})()`;
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleSchZoomToFit(): Promise<string> {
  const code = `(async()=>{try{await eda.dmt_EditorControl.zoomToAllPrimitives();return JSON.stringify({ok:true,value:"zoomed"});}catch(e){return JSON.stringify({ok:false,error:e?.message??String(e)});}})()`;
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}
