// JS code string builder helpers

export function js(strings: TemplateStringsArray, ...values: unknown[]): string {
  return strings.reduce((acc, str, i) => {
    const val = values[i];
    if (val === undefined) return acc + str;
    return acc + str + serializeValue(val);
  }, "");
}

function serializeValue(val: unknown): string {
  if (val === null || val === undefined) return "null";
  if (typeof val === "string") return JSON.stringify(val);
  if (typeof val === "number") {
    // Format numbers with fixed precision to avoid floating point noise
    return Number.isInteger(val) ? String(val) : val.toFixed(4);
  }
  if (typeof val === "boolean") return String(val);
  if (typeof val === "object") {
    return JSON.stringify(val, null, 2);
  }
  return String(val);
}

/**
 * Build a complete executable code string wrapped in try/catch.
 * The code is run as an async IIFE so await can be used.
 */
export function buildExecuteBlock(code: string): string {
  return `(async () => {
  try {
    const __result = (${code});
    return JSON.stringify({ ok: true, value: __result });
  } catch (e) {
    return JSON.stringify({ ok: false, error: e?.message ?? String(e) });
  }
})()`;
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
