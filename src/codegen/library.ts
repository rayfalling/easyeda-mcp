import { buildExecuteBlock } from "./builder.js";

// ─── Library Search ────────────────────────────────────────────────

export function generateLibrarySearch(params: {
  keyword: string;
  type: string;
  limit: number;
}): string {
  const module = params.type === "footprint" ? "eda.lib_Footprint" : "eda.lib_Device";
  return buildExecuteBlock(`
    const results = await ${module}.search("${params.keyword}", { limit: ${params.limit} });
    results.map(r => ({
      uuid: r.uuid || r.deviceUuid,
      name: r.name || r.deviceName,
      package: r.package || r.footprintName,
      description: r.description || "",
      type: "${params.type}",
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

export function generateLibraryPlaceFromSearch(params: {
  libraryUuid: string;
  type: string;
  lx: number;
  ly: number;
  rotation: number;
  documentUuid?: string;
}): string {
  if (params.type === "footprint" || params.type === "component") {
    const module = params.type === "footprint" ? "eda.pcb_PrimitiveComponent" : "eda.sch_PrimitiveComponent";
    return buildExecuteBlock(`
      const obj = await ${module}.create(
        { lx: ${params.lx}, ly: ${params.ly} },
        "${params.libraryUuid}"
      );
      if (${params.rotation}) obj.setRotation(${params.rotation});
      obj
    `);
  }
  // symbol — place in schematic
  return buildExecuteBlock(`
    const sym = await eda.sch_PrimitiveComponent.create(
      { lx: ${params.lx}, ly: ${params.ly} },
      "${params.libraryUuid}"
    );
    if (${params.rotation}) sym.setRotation(${params.rotation});
    sym
  `);
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
