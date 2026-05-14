/**
 * Build a complete executable code string wrapped in try/catch.
 */
export function buildExecuteBlock(code: string): string {
  return `(async()=>{try{const r=${code};return JSON.stringify({ok:true,value:r});}catch(e){return JSON.stringify({ok:false,error:e?.message??String(e)});}})()`;
}

/**
 * Parse the result from the code execution block.
 */
export function parseExecuteResult(raw: unknown): unknown {
  if (typeof raw !== "string") return raw;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && "ok" in parsed) {
      if (parsed.ok) return parsed.value;
      throw new Error(parsed.error ?? "Unknown EDA error");
    }
    return parsed;
  } catch (e) {
    if (e instanceof SyntaxError) return raw;
    throw e;
  }
}
