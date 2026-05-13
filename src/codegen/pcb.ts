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
    if ("${params.layer}" === "bottom") fp.setLayer("bottom");
    fp
  `);
}

// ─── Place Track ───────────────────────────────────────────────────

export function generatePcbPlaceTrack(params: {
  x1: number; y1: number; x2: number; y2: number;
  width: number; layer: string; pcbUuid?: string;
}): string {
  return buildExecuteBlock(`
    const track = await eda.pcb_PrimitiveLine.create({
      lx: ${params.x1}, ly: ${params.y1},
      to_lx: ${params.x2}, to_ly: ${params.y2},
      width: ${params.width},
      layer: "${params.layer}"
    });
    track
  `);
}

// ─── Place Via ─────────────────────────────────────────────────────

export function generatePcbPlaceVia(params: {
  lx: number; ly: number; holeSize: number; padSize: number; pcbUuid?: string;
}): string {
  return buildExecuteBlock(`
    const via = await eda.pcb_PrimitiveVia.create({
      lx: ${params.lx}, ly: ${params.ly},
      holeSize: ${params.holeSize},
      padSize: ${params.padSize}
    });
    via
  `);
}

// ─── Place Copper Area ─────────────────────────────────────────────

export function generatePcbPlaceCopperArea(params: {
  points: Array<{ x: number; y: number }>;
  layer: string;
  pcbUuid?: string;
}): string {
  const ptsJson = JSON.stringify(params.points.map(p => ({ lx: p.x, ly: p.y })));
  return buildExecuteBlock(`
    const pour = await eda.pcb_PrimitivePour.create({
      points: ${ptsJson},
      layer: "${params.layer}"
    });
    pour
  `);
}

// ─── Select ─────────────────────────────────────────────────────────

export function generatePcbSelect(params: { lx: number; ly: number; pcbUuid?: string }): string {
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
      } catch(e) { /* skip */ }
    }
    if (closest) {
      await eda.pcb_SelectControl.doSelectPrimitives([closest]);
    }
    ({ selected: !!closest, distance: Math.sqrt(closestDist) })
  `);
}

// ─── Get Selected ───────────────────────────────────────────────────

export function generatePcbGetSelected(params: { pcbUuid?: string }): string {
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

export function generatePcbDeleteSelected(params: { pcbUuid?: string }): string {
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
      } catch(e) { /* skip */ }
    }
    await eda.pcb_SelectControl.clearSelected();
    ({ deleted, total: selected.length })
  `);
}

// ─── Move ───────────────────────────────────────────────────────────

export function generatePcbMove(params: { dx: number; dy: number; pcbUuid?: string }): string {
  return buildExecuteBlock(`
    const selected = await eda.pcb_SelectControl.getSelectedPrimitives();
    let moved = 0;
    for (const s of selected) {
      try {
        const newX = (s.x || s.lx || 0) + ${params.dx};
        const newY = (s.y || s.ly || 0) + ${params.dy};
        const type = s.primitiveType;
        const id = s.primitiveId;
        if (type === 'Component') await eda.pcb_PrimitiveComponent.modify(id, { lx: newX, ly: newY });
        else if (type === 'Line') await eda.pcb_PrimitiveLine.modify(id, { lx: newX, ly: newY });
        else if (type === 'Via') await eda.pcb_PrimitiveVia.modify(id, { lx: newX, ly: newY });
        else if (type === 'Pad') await eda.pcb_PrimitivePad.modify(id, { lx: newX, ly: newY });
        moved++;
      } catch(e) { /* skip */ }
    }
    ({ moved, total: selected.length })
  `);
}
