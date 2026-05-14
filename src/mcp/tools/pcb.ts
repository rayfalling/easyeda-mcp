import { executeCode } from "../../bridge/server.js";
import { parseExecuteResult } from "../../codegen/builder.js";

function wrap(code: string): string {
  return `(async()=>{try{const r=${code};return JSON.stringify({ok:true,value:r});}catch(e){return JSON.stringify({ok:false,error:e?.message??String(e)});}})()`;
}

export async function handlePcbPlaceFootprint(params: {
  lx: number; ly: number; libraryUuid: string;
  rotation?: number; layer?: string;
}): Promise<string> {
  const raw = await executeCode(wrap(
    `(await eda.pcb_PrimitiveComponent.create((await eda.lib_Footprint.search("${params.libraryUuid}"))[0],${params.lx},${params.ly},${params.rotation??0}))`
  ));
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handlePcbPlaceTrack(params: {
  x1: number; y1: number; x2: number; y2: number;
  width?: number; layer?: string;
}): Promise<string> {
  const raw = await executeCode(wrap(
    `await eda.pcb_PrimitiveLine.create([${params.x1},${params.y1},${params.x2},${params.y2}],undefined,undefined,${params.width??10})`
  ));
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handlePcbPlaceVia(params: {
  lx: number; ly: number; holeSize?: number; padSize?: number;
}): Promise<string> {
  const raw = await executeCode(wrap(
    `await eda.pcb_PrimitiveVia.create(${params.lx},${params.ly},${params.holeSize??12},${params.padSize??24})`
  ));
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handlePcbPlaceCopperArea(params: {
  points: Array<{ x: number; y: number }>; layer?: string;
}): Promise<string> {
  const pts = params.points.flatMap(p => [p.x, p.y]).join(",");
  const raw = await executeCode(wrap(`await eda.pcb_PrimitivePour.create([${pts}])`));
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handlePcbSelect(params: { lx: number; ly: number }): Promise<string> {
  const raw = await executeCode(`(async()=>{try{await eda.pcb_SelectControl.clearSelected();const mods=[eda.pcb_PrimitiveComponent,eda.pcb_PrimitiveLine,eda.pcb_PrimitiveVia];let best=null,bd=1e9;for(const m of mods){try{const all=await m.getAll();for(const p of all){const dx=(p.x||p.lx||0)-${params.lx};const dy=(p.y||p.ly||0)-${params.ly};const d=dx*dx+dy*dy;if(d<bd){bd=d;best=p;}}}catch(e){}}if(best)await eda.pcb_SelectControl.doSelectPrimitives([best]);return JSON.stringify({ok:true,value:{selected:!!best}});}catch(e){return JSON.stringify({ok:false,error:e?.message??String(e)});}})()`);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handlePcbGetSelected(): Promise<string> {
  const raw = await executeCode(wrap(`(await eda.pcb_SelectControl.getSelectedPrimitives()).map(x=>({id:x.primitiveId,type:x.primitiveType}))`));
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handlePcbDeleteSelected(): Promise<string> {
  const raw = await executeCode(`(async()=>{try{const s=await eda.pcb_SelectControl.getSelectedPrimitives();let d=0;for(const x of s){try{const t=x.primitiveType;if(t==='Component')await eda.pcb_PrimitiveComponent.delete(x.primitiveId);else if(t==='Line')await eda.pcb_PrimitiveLine.delete(x.primitiveId);else if(t==='Via')await eda.pcb_PrimitiveVia.delete(x.primitiveId);d++;}catch(e){}}await eda.pcb_SelectControl.clearSelected();return JSON.stringify({ok:true,value:{deleted:d}});}catch(e){return JSON.stringify({ok:false,error:e?.message??String(e)});}})()`);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handlePcbMove(params: { dx: number; dy: number }): Promise<string> {
  const raw = await executeCode(`(async()=>{try{const s=await eda.pcb_SelectControl.getSelectedPrimitives();let m=0;for(const x of s){try{const nx=(x.x||x.lx||0)+${params.dx};const ny=(x.y||x.ly||0)+${params.dy};const t=x.primitiveType;if(t==='Component')await eda.pcb_PrimitiveComponent.modify(x.primitiveId,{x:nx,y:ny});else if(t==='Via')await eda.pcb_PrimitiveVia.modify(x.primitiveId,{x:nx,y:ny});m++;}catch(e){}}return JSON.stringify({ok:true,value:{moved:m}});}catch(e){return JSON.stringify({ok:false,error:e?.message??String(e)});}})()`);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}
