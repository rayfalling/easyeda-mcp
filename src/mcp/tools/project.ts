import { executeCode } from "../../bridge/server.js";
import { parseExecuteResult } from "../../codegen/builder.js";

function wrap(code: string): string {
  return `(async()=>{try{const r=${code};return JSON.stringify({ok:true,value:r});}catch(e){return JSON.stringify({ok:false,error:e?.message??String(e)});}})()`;
}

export async function handleProjectList(): Promise<string> {
  const raw = await executeCode(`(async()=>{try{const uuids=await eda.dmt_Project.getAllProjectsUuid();const r=[];for(const u of uuids.slice(0,10)){const i=await eda.dmt_Project.getProjectInfo(u);if(i)r.push(i);}return JSON.stringify({ok:true,value:r});}catch(e){return JSON.stringify({ok:false,error:e?.message??String(e)});}})()`);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleProjectOpen(params: { projectUuid: string }): Promise<string> {
  const raw = await executeCode(wrap(`await eda.dmt_Project.openProject("${params.projectUuid}")`));
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleProjectCreate(params: {
  name: string; teamUuid?: string; folderUuid?: string; description?: string;
}): Promise<string> {
  const raw = await executeCode(wrap(`await eda.dmt_Project.createProject("${params.name}",undefined,${params.teamUuid?`"${params.teamUuid}"`:"undefined"},${params.folderUuid?`"${params.folderUuid}"`:"undefined"},${params.description?`"${params.description}"`:"undefined"})`));
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleSchematicList(): Promise<string> {
  const raw = await executeCode(wrap(`(await eda.dmt_Schematic.getAllSchematicsInfo()).map(i=>({uuid:i.uuid,name:i.name}))`));
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleSchematicCreate(params: { name?: string }): Promise<string> {
  const raw = await executeCode(wrap(`await eda.dmt_Schematic.createSchematic("${params.name||"Schematic1"}")`));
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handlePcbList(): Promise<string> {
  const raw = await executeCode(wrap(`(await eda.dmt_Pcb.getAllPcbsInfo()).map(i=>({uuid:i.uuid,name:i.name}))`));
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handlePcbCreate(params: { name?: string }): Promise<string> {
  const raw = await executeCode(wrap(`await eda.dmt_Pcb.createPcb("${params.name||"PCB1"}")`));
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleDocumentOpen(params: { documentUuid: string }): Promise<string> {
  const raw = await executeCode(wrap(`await eda.dmt_EditorControl.openDocument("${params.documentUuid}")`));
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleDocumentGetCurrent(): Promise<string> {
  const raw = await executeCode(wrap(`await eda.dmt_SelectControl.getCurrentDocumentInfo()`));
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}
