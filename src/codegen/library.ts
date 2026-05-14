import { buildExecuteBlock } from "./builder.js";

// ─── Library Search ────────────────────────────────────────────────

export function generateLibrarySearch(params: {
  keyword: string;
  type: string;
  limit?: number;
}): string {
  const module = params.type === "footprint" ? "eda.lib_Footprint" : "eda.lib_Device";
  return buildExecuteBlock(`
    const results = await ${module}.search("${params.keyword}");
    results.slice(0, ${params.limit ?? 20}).map(r => ({
      uuid: r.uuid || r.deviceUuid,
      name: r.name || r.deviceName,
      package: r.package || r.footprintName,
    }))
  `);
}

// ─── Get Component Info ────────────────────────────────────────────

export function generateLibraryGetComponentInfo(params: {
  libraryUuid: string;
  type: string;
}): string {
  const module = params.type === "footprint" ? "eda.lib_Footprint" : "eda.lib_Device";
  return buildExecuteBlock(`
    ${module}.get("${params.libraryUuid}")
  `);
}

// ─── Place From Search ─────────────────────────────────────────────
// create(componentRef, x, y, rotation?, mirror?, addIntoBom?, addIntoPcb?)

export function generateLibraryPlaceFromSearch(params: {
  libraryUuid: string;
  type: string;
  lx: number;
  ly: number;
  rotation?: number;
}): string {
  if (params.type === "footprint") {
    return buildExecuteBlock(`
      const dev = (await eda.lib_Footprint.search("${params.libraryUuid}"))[0];
      await eda.pcb_PrimitiveComponent.create(dev, ${params.lx}, ${params.ly}, ${params.rotation ?? 0})
    `);
  } else {
    return buildExecuteBlock(`
      const dev = (await eda.lib_Device.search("${params.libraryUuid}"))[0];
      await eda.sch_PrimitiveComponent.create(dev, ${params.lx}, ${params.ly}, ${params.rotation ?? 0})
    `);
  }
}

// ─── Screenshot ────────────────────────────────────────────────────

export function generateScreenshot(params: { tabId?: string }): string {
  const tabParam = params.tabId ? `"${params.tabId}"` : "undefined";
  return buildExecuteBlock(`
    const blob = await eda.dmt_EditorControl.getCurrentRenderedAreaImage(${tabParam});
    if (!blob) throw new Error("Failed to capture screenshot");
    const arr = new Uint8Array(await blob.arrayBuffer());
    let binary = '';
    for (let i = 0; i < arr.length; i++) {
      binary += String.fromCharCode(arr[i]);
    }
    "data:" + blob.type + ";base64," + btoa(binary)
  `);
}
