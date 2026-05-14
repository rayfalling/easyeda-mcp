import { buildExecuteBlock } from "./builder.js";

// ─── Place Footprint on PCB ───────────────────────────────────────
// create(componentRef, x, y, rotation?, mirror?, addIntoBom?, addIntoPcb?)

export function generatePcbPlaceFootprint(params: {
  lx: number; ly: number;
  libraryUuid: string;
  rotation?: number;
  layer?: string;
}): string {
  return buildExecuteBlock(`
    const dev = (await eda.lib_Footprint.search("${params.libraryUuid}"))[0];
    const fp = await eda.pcb_PrimitiveComponent.create(
      dev,
      ${params.lx}, ${params.ly},
      ${params.rotation ?? 0}
    );
    fp
  `);
}

// ─── Place Track on PCB ───────────────────────────────────────────
// create(line: number[], net?, color?, lineWidth?, lineType?)

export function generatePcbPlaceTrack(params: {
  x1: number; y1: number;
  x2: number; y2: number;
  width?: number;
  layer?: string;
}): string {
  return buildExecuteBlock(`
    await eda.pcb_PrimitiveLine.create(
      [${params.x1}, ${params.y1}, ${params.x2}, ${params.y2}],
      undefined, undefined,
      ${params.width ?? 10}
    )
  `);
}

// ─── Place Via ─────────────────────────────────────────────────────

export function generatePcbPlaceVia(params: {
  lx: number; ly: number;
  holeSize?: number;
  padSize?: number;
}): string {
  return buildExecuteBlock(`
    await eda.pcb_PrimitiveVia.create(
      ${params.lx}, ${params.ly},
      ${params.holeSize ?? 12},
      ${params.padSize ?? 24}
    )
  `);
}

// ─── Place Copper Pour ─────────────────────────────────────────────

export function generatePcbPlaceCopperArea(params: {
  points: Array<{ x: number; y: number }>;
  layer?: string;
}): string {
  const pts = params.points.flatMap(p => [p.x, p.y]);
  return buildExecuteBlock(`
    await eda.pcb_PrimitivePour.create(
      [${pts.join(", ")}]
    )
  `);
}

// ─── Select ─────────────────────────────────────────────────────────

export function generatePcbSelect(params: { lx: number; ly: number }): string {
  return buildExecuteBlock(`
    await eda.pcb_SelectControl.clearSelected();
    const modules = [
      eda.pcb_PrimitiveComponent,
      eda.pcb_PrimitiveLine,
      eda.pcb_PrimitiveVia,
      eda.pcb_PrimitivePad,
    ];
    let closest = null, closestDist = Infinity;
    for (const mod of modules) {
      try {
        const all = await mod.getAll();
        for (const p of all) {
          const dx = (p.x || p.lx || 0) - ${params.lx};
          const dy = (p.y || p.ly || 0) - ${params.ly};
          const dist = dx * dx + dy * dy;
          if (dist < closestDist) { closestDist = dist; closest = p; }
        }
      } catch(e) {}
    }
    if (closest) {
      await eda.pcb_SelectControl.doSelectPrimitives([closest]);
    }
    ({ selected: !!closest, distance: Math.sqrt(closestDist) })
  `);
}

// ─── Get Selected ───────────────────────────────────────────────────

export function generatePcbGetSelected(): string {
  return buildExecuteBlock(`
    const selected = await eda.pcb_SelectControl.getSelectedPrimitives();
    selected.map(s => ({
      primitiveId: s.primitiveId,
      primitiveType: s.primitiveType,
      x: s.x || s.lx,
      y: s.y || s.ly,
    }))
  `);
}

// ─── Delete Selected ────────────────────────────────────────────────

export function generatePcbDeleteSelected(): string {
  return buildExecuteBlock(`
    const selected = await eda.pcb_SelectControl.getSelectedPrimitives();
    let deleted = 0;
    for (const s of selected) {
      try {
        const type = s.primitiveType;
        const id = s.primitiveId;
        if (type === 'Component') await eda.pcb_PrimitiveComponent.delete(id);
        else if (type === 'Line') await eda.pcb_PrimitiveLine.delete(id);
        else if (type === 'Via') await eda.pcb_PrimitiveVia.delete(id);
        else if (type === 'Pad') await eda.pcb_PrimitivePad.delete(id);
        else await eda.pcb_PrimitiveObject.delete(id);
        deleted++;
      } catch(e) {}
    }
    await eda.pcb_SelectControl.clearSelected();
    ({ deleted, total: selected.length })
  `);
}

// ─── Move ───────────────────────────────────────────────────────────

export function generatePcbMove(params: { dx: number; dy: number }): string {
  return buildExecuteBlock(`
    const selected = await eda.pcb_SelectControl.getSelectedPrimitives();
    let moved = 0;
    for (const s of selected) {
      try {
        const newX = (s.x || s.lx || 0) + ${params.dx};
        const newY = (s.y || s.ly || 0) + ${params.dy};
        const type = s.primitiveType;
        const id = s.primitiveId;
        if (type === 'Component') await eda.pcb_PrimitiveComponent.modify(id, { x: newX, y: newY });
        else if (type === 'Line') await eda.pcb_PrimitiveLine.modify(id, { line: [] });
        else if (type === 'Via') await eda.pcb_PrimitiveVia.modify(id, { x: newX, y: newY });
        moved++;
      } catch(e) {}
    }
    ({ moved, total: selected.length })
  `);
}
