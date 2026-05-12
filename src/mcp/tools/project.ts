import { executeCode } from "../../bridge/server.js";
import { parseExecuteResult } from "../../codegen/builder.js";
import {
  generateProjectList,
  generateProjectOpen,
  generateProjectCreate,
  generateSchematicList,
  generateSchematicCreate,
  generatePcbList,
  generatePcbCreate,
  generateDocumentOpen,
  generateDocumentGetCurrent,
} from "../../codegen/project.js";

export async function handleProjectList(params: { teamUuid?: string; folderUuid?: string }): Promise<string> {
  const code = generateProjectList(params);
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleProjectOpen(params: { projectUuid: string }): Promise<string> {
  const code = generateProjectOpen(params);
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleProjectCreate(params: {
  name: string;
  teamUuid?: string;
  folderUuid?: string;
  description?: string;
}): Promise<string> {
  const code = generateProjectCreate(params);
  const raw = await executeCode(code);
  const result = parseExecuteResult(raw);
  return JSON.stringify({ uuid: result, message: `Project '${params.name}' created` }, null, 2);
}

export async function handleSchematicList(params: { projectUuid?: string }): Promise<string> {
  const code = generateSchematicList(params);
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleSchematicCreate(params: { name?: string; parentUuid?: string }): Promise<string> {
  const code = generateSchematicCreate(params);
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handlePcbList(params: { projectUuid?: string }): Promise<string> {
  const code = generatePcbList(params);
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handlePcbCreate(params: { name?: string }): Promise<string> {
  const code = generatePcbCreate(params);
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleDocumentOpen(params: { documentUuid: string }): Promise<string> {
  const code = generateDocumentOpen(params);
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleDocumentGetCurrent(): Promise<string> {
  const code = generateDocumentGetCurrent({});
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}
