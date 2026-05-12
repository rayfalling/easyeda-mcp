import { executeCode, getBridgeStatus, getEdaWindows, selectEdaWindow } from "../../bridge/server.js";
import { buildExecuteBlock, parseExecuteResult } from "../../codegen/builder.js";

export async function handleExecuteEdaCode(params: { code: string }): Promise<string> {
  const codeBlock = buildExecuteBlock(params.code);
  const raw = await executeCode(codeBlock);
  const result = parseExecuteResult(raw);
  return JSON.stringify(result, null, 2);
}

export function handleEdaHealth(): string {
  const status = getBridgeStatus();
  const windows = getEdaWindows();
  return JSON.stringify({ ...status, ...windows }, null, 2);
}

export function handleEdaSelectWindow(params: { windowId: string }): string {
  const ok = selectEdaWindow(params.windowId);
  if (!ok) {
    return JSON.stringify({ error: `Window "${params.windowId}" not found` });
  }
  return JSON.stringify({ success: true, activeWindowId: params.windowId });
}
