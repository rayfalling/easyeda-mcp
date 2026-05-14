import { buildExecuteBlock, parseExecuteResult } from "./builder.js";

// ─── Text ──────────────────────────────────────────────────────────
// create(x: number, y: number, content: string, rotation?, ...)

export function generateText(params: {
  x: number; y: number; content: string;
  rotation?: number; fontSize?: number; bold?: boolean;
}): string {
  return buildExecuteBlock(`
    await eda.sch_PrimitiveText.create(
      ${params.x}, ${params.y},
      "${params.content}",
      ${params.rotation ?? 0},
      null, null,
      ${params.fontSize ?? 60},
      ${params.bold ?? false}
    )
  `);
}

export function generateWire(params: {
  x1: number; y1: number;
  x2: number; y2: number;
  net?: string;
}): string {
  return buildExecuteBlock(`
    await eda.sch_PrimitiveWire.create(
      [${params.x1}, ${params.y1}, ${params.x2}, ${params.y2}],
      ${params.net ? `"${params.net}"` : "undefined"}
    )
  `);
}

// ─── Place Component ───────────────────────────────────────────────
// create(componentRef: searchResult | {libraryUuid, uuid}, x, y, rotation?, mirror?, addIntoBom?, addIntoPcb?)

export function generateSchPlaceComponent(params: {
  lx: number; ly: number;
  libraryUuid: string;
  rotation?: number;
  flip?: boolean;
}): string {
  return buildExecuteBlock(`
    const dev = (await eda.lib_Device.search("${params.libraryUuid}"))[0];
    await eda.sch_PrimitiveComponent.create(
      dev,
      ${params.lx}, ${params.ly},
      ${params.rotation ?? 0},
      ${params.flip ?? false}
    )
  `);
}
