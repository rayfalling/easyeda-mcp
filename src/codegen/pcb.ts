import { buildExecuteBlock } from "./builder.js";

// ─── Place Footprint ───────────────────────────────────────────────

export function generatePcbPlaceFootprint(params: {
  lx: number; ly: number; libraryUuid: string;
  rotation: number; layer: string; pcbUuid?: string;
}): string {
  return buildExecuteBlock(`
    const fp = await eda.pcb_PrimitiveComponent.create(
      { lx: ${params.lx}, ly: ${params.ly} },
      "${params.libraryUuid}"
    );
    if (${params.rotation}) fp.setRotation(${params.rotation});
    if ("${params.layer}" === "bottom") fp.setLayer(eda.pcb_PrimitiveComponent.LAYER_BOTTOM);
    fp
  `);
}

// ─── Place Track ───────────────────────────────────────────────────

export function generatePcbPlaceTrack(params: {
  x1: number; y1: number; x2: number; y2: number;
  width: number; layer: string; pcbUuid?: string;
}): string {
  return buildExecuteBlock(`
    const track = await eda.pcb_PrimitiveTrack.create(
      { x: ${params.x1}, y: ${params.y1} },
      { x: ${params.x2}, y: ${params.y2} }
    );
    track.setWidth(${params.width});
    if ("${params.layer}" === "bottom") track.setLayer(eda.pcb_PrimitiveTrack.LAYER_BOTTOM);
    track
  `);
}

// ─── Place Via ─────────────────────────────────────────────────────

export function generatePcbPlaceVia(params: {
  lx: number; ly: number; holeSize: number; padSize: number; pcbUuid?: string;
}): string {
  return buildExecuteBlock(`
    const via = await eda.pcb_PrimitiveVia.create(
      { x: ${params.lx}, y: ${params.ly} }
    );
    via.setHoleSize(${params.holeSize});
    via.setPadSize(${params.padSize});
    via
  `);
}

// ─── Place Copper Area ─────────────────────────────────────────────

export function generatePcbPlaceCopperArea(params: {
  points: Array<{ x: number; y: number }>;
  layer: string;
  pcbUuid?: string;
}): string {
  const ptsJson = JSON.stringify(params.points);
  return buildExecuteBlock(`
    const pts = ${ptsJson};
    const polygon = await eda.pcb_PrimitivePolygon.create(pts);
    if ("${params.layer}" === "bottom") polygon.setLayer(eda.pcb_PrimitivePolygon.LAYER_BOTTOM);
    polygon
  `);
}

// ─── Select ─────────────────────────────────────────────────────────

export function generatePcbSelect(params: { lx: number; ly: number; pcbUuid?: string }): string {
  return buildExecuteBlock(`
    await eda.pcb_SelectControl.select(${params.lx}, ${params.ly});
    { success: true }
  `);
}

// ─── Get Selected ───────────────────────────────────────────────────

export function generatePcbGetSelected(params: { pcbUuid?: string }): string {
  return buildExecuteBlock(`
    const selected = await eda.pcb_SelectControl.getSelections();
    selected.map(s => ({ id: s.id, type: s.type, x: s.x, y: s.y }))
  `);
}

// ─── Delete Selected ────────────────────────────────────────────────

export function generatePcbDeleteSelected(params: { pcbUuid?: string }): string {
  return buildExecuteBlock(`
    await eda.pcb_SelectControl.deleteSelections();
    { success: true }
  `);
}

// ─── Move ───────────────────────────────────────────────────────────

export function generatePcbMove(params: { dx: number; dy: number; pcbUuid?: string }): string {
  return buildExecuteBlock(`
    const items = await eda.pcb_SelectControl.getSelections();
    for (const item of items) {
      await item.moveBy(${params.dx}, ${params.dy});
    }
    { success: true, movedCount: items.length }
  `);
}
