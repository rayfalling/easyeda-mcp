import { executeCode } from "../../bridge/server.js";
import { parseExecuteResult } from "../../codegen/builder.js";
import {
  generateLibrarySearch,
  generateLibraryGetComponentInfo,
  generateLibraryPlaceFromSearch,
  generateScreenshot,
} from "../../codegen/library.js";

export async function handleLibrarySearch(params: {
  keyword: string; type: string; limit: number;
}): Promise<string> {
  const code = generateLibrarySearch(params);
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleLibraryGetComponentInfo(params: {
  libraryUuid: string; type: string;
}): Promise<string> {
  const code = generateLibraryGetComponentInfo(params);
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleLibraryPlaceFromSearch(params: {
  libraryUuid: string; type: string;
  lx: number; ly: number; rotation: number; documentUuid?: string;
}): Promise<string> {
  const code = generateLibraryPlaceFromSearch(params);
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleEdaScreenshot(params: { tabId?: string }): Promise<string> {
  const code = generateScreenshot(params);
  const raw = await executeCode(code);
  const result = parseExecuteResult(raw);
  // Screenshot returns a base64 data URL — pass through as-is
  if (typeof result === "string" && result.startsWith("data:")) {
    return JSON.stringify({ imageDataUrl: result });
  }
  return JSON.stringify(result, null, 2);
}
