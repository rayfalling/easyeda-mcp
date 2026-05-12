import { buildExecuteBlock } from "./builder.js";

// ─── Place Component ───────────────────────────────────────────────

export function generateSchPlaceComponent(params: {
  lx: number;
  ly: number;
  libraryUuid: string;
  rotation: number;
  flip: boolean;
  pageUuid?: string;
}): string {
  const pageTarget = params.pageUuid
    ? `await eda.dmt_Schematic.getSchematicPageInfo("${params.pageUuid}")`
    : `(await eda.dmt_Schematic.getCurrentSchematicPageInfo())`;
  return buildExecuteBlock(`
    const page = ${pageTarget};
    if (!page) throw new Error("No schematic page open");
    const comp = await eda.sch_PrimitiveComponent.create(
      { lx: ${params.lx}, ly: ${params.ly} },
      "${params.libraryUuid}"
    );
    if (${params.rotation}) comp.setRotation(${params.rotation});
    if (${params.flip}) comp.setFlip(true);
    comp
  `);
}

// ─── Place Wire ────────────────────────────────────────────────────

export function generateSchPlaceWire(params: {
  x1: number; y1: number;
  x2: number; y2: number;
  pageUuid?: string;
}): string {
  return buildExecuteBlock(`
    const wire = await eda.sch_PrimitiveWire.create(
      { x: ${params.x1}, y: ${params.y1} },
      { x: ${params.x2}, y: ${params.y2} }
    );
    wire
  `);
}

// ─── Place Netlabel ─────────────────────────────────────────────────

export function generateSchPlaceNetlabel(params: {
  lx: number;
  ly: number;
  netName: string;
  rotation: number;
  pageUuid?: string;
}): string {
  return buildExecuteBlock(`
    const label = await eda.sch_PrimitiveNetLabel.create(
      { lx: ${params.lx}, ly: ${params.ly} },
      "${params.netName}"
    );
    if (${params.rotation}) label.setRotation(${params.rotation});
    label
  `);
}

// ─── Place Text ─────────────────────────────────────────────────────

export function generateSchPlaceText(params: {
  lx: number;
  ly: number;
  text: string;
  rotation: number;
  height: number;
  pageUuid?: string;
}): string {
  return buildExecuteBlock(`
    const txt = await eda.sch_PrimitiveString.create(
      { lx: ${params.lx}, ly: ${params.ly} },
      "${params.text}"
    );
    txt.setTextHeight(${params.height});
    if (${params.rotation}) txt.setRotation(${params.rotation});
    txt
  `);
}

// ─── Select ─────────────────────────────────────────────────────────

export function generateSchSelect(params: {
  lx: number;
  ly: number;
  pageUuid?: string;
}): string {
  return buildExecuteBlock(`
    await eda.sch_SelectControl.select(${params.lx}, ${params.ly});
    { success: true }
  `);
}

// ─── Get Selected ───────────────────────────────────────────────────

export function generateSchGetSelected(params: { pageUuid?: string }): string {
  return buildExecuteBlock(`
    const selected = await eda.sch_SelectControl.getSelections();
    selected.map(s => ({
      id: s.id,
      type: s.type,
      x: s.x,
      y: s.y,
    }))
  `);
}

// ─── Delete Selected ────────────────────────────────────────────────

export function generateSchDeleteSelected(params: { pageUuid?: string }): string {
  return buildExecuteBlock(`
    await eda.sch_SelectControl.deleteSelections();
    { success: true }
  `);
}

// ─── Move ───────────────────────────────────────────────────────────

export function generateSchMove(params: {
  dx: number;
  dy: number;
  pageUuid?: string;
}): string {
  return buildExecuteBlock(`
    const items = await eda.sch_SelectControl.getSelections();
    for (const item of items) {
      await item.moveBy(${params.dx}, ${params.dy});
    }
    { success: true, movedCount: items.length }
  `);
}

// ─── Zoom to Fit ────────────────────────────────────────────────────

export function generateSchZoomToFit(params: { pageUuid?: string }): string {
  return buildExecuteBlock(`
    await eda.dmt_EditorControl.zoomToAllPrimitives();
    { success: true }
  `);
}
