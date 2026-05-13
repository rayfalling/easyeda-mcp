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
  return buildExecuteBlock(`
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
    await eda.sch_PrimitiveWire.create({
      lx: ${params.x1}, ly: ${params.y1},
      to_lx: ${params.x2}, to_ly: ${params.y2}
    })
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
    const txt = await eda.sch_PrimitiveText.create(
      { lx: ${params.lx}, ly: ${params.ly} },
      "${params.netName}"
    );
    if (${params.rotation}) txt.setRotation(${params.rotation});
    txt
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
    const txt = await eda.sch_PrimitiveText.create(
      { lx: ${params.lx}, ly: ${params.ly} },
      "${params.text}"
    );
    txt.setFontSize(${params.height});
    if (${params.rotation}) txt.setRotation(${params.rotation});
    txt
  `);
}

// ─── Select (by nearest primitive to coordinates) ───────────────────

export function generateSchSelect(params: {
  lx: number;
  ly: number;
  pageUuid?: string;
}): string {
  return buildExecuteBlock(`
    await eda.sch_SelectControl.clearSelected();
    // Collect all selectable primitives
    const modules = [
      eda.sch_PrimitiveComponent,
      eda.sch_PrimitiveWire,
      eda.sch_PrimitiveText,
    ];
    let closest = null, closestDist = Infinity;
    for (const mod of modules) {
      const all = await mod.getAll();
      for (const p of all) {
        const dx = (p.x || p.lx || 0) - ${params.lx};
        const dy = (p.y || p.ly || 0) - ${params.ly};
        const dist = dx * dx + dy * dy;
        if (dist < closestDist) { closestDist = dist; closest = p; }
      }
    }
    if (closest) {
      await eda.sch_SelectControl.doSelectPrimitives([closest]);
    }
    ({ selected: !!closest, distance: Math.sqrt(closestDist) })
  `);
}

// ─── Get Selected ───────────────────────────────────────────────────

export function generateSchGetSelected(params: { pageUuid?: string }): string {
  return buildExecuteBlock(`
    const selected = await eda.sch_SelectControl.getSelectedPrimitives();
    selected.map(s => ({
      primitiveId: s.primitiveId,
      primitiveType: s.primitiveType,
      x: s.x || s.lx,
      y: s.y || s.ly,
    }))
  `);
}

// ─── Delete Selected ────────────────────────────────────────────────

export function generateSchDeleteSelected(params: { pageUuid?: string }): string {
  return buildExecuteBlock(`
    const selected = await eda.sch_SelectControl.getSelectedPrimitives();
    let deleted = 0;
    for (const s of selected) {
      try {
        // Determine the correct delete module by primitiveType
        const type = s.primitiveType;
        if (type === 'Component') await eda.sch_PrimitiveComponent.delete(s.primitiveId);
        else if (type === 'Wire') await eda.sch_PrimitiveWire.delete(s.primitiveId);
        else if (type === 'Text') await eda.sch_PrimitiveText.delete(s.primitiveId);
        else await eda.sch_PrimitiveObject.delete(s.primitiveId);
        deleted++;
      } catch(e) { /* skip */ }
    }
    await eda.sch_SelectControl.clearSelected();
    ({ deleted, total: selected.length })
  `);
}

// ─── Move ───────────────────────────────────────────────────────────

export function generateSchMove(params: {
  dx: number;
  dy: number;
  pageUuid?: string;
}): string {
  return buildExecuteBlock(`
    const selected = await eda.sch_SelectControl.getSelectedPrimitives();
    let moved = 0;
    for (const s of selected) {
      try {
        const newX = (s.x || s.lx || 0) + ${params.dx};
        const newY = (s.y || s.ly || 0) + ${params.dy};
        const type = s.primitiveType;
        if (type === 'Component') await eda.sch_PrimitiveComponent.modify(s.primitiveId, { lx: newX, ly: newY });
        else if (type === 'Wire') await eda.sch_PrimitiveWire.modify(s.primitiveId, { lx: newX, ly: newY });
        else if (type === 'Text') await eda.sch_PrimitiveText.modify(s.primitiveId, { lx: newX, ly: newY });
        moved++;
      } catch(e) { /* skip */ }
    }
    ({ moved, total: selected.length })
  `);
}

// ─── Zoom to Fit ────────────────────────────────────────────────────

export function generateSchZoomToFit(params: { pageUuid?: string }): string {
  return buildExecuteBlock(`
    await eda.dmt_EditorControl.zoomToAllPrimitives();
    "zoomed"
  `);
}
