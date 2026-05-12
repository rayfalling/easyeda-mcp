import { buildExecuteBlock } from "./builder.js";

// ─── Library Search ────────────────────────────────────────────────

export function generateLibrarySearch(params: {
  keyword: string;
  type: string;
  limit: number;
}): string {
  return buildExecuteBlock(`
    const results = await eda.lib_Search.search("${params.keyword}", {
      type: "${params.type}",
      limit: ${params.limit},
    });
    results.map(r => ({
      uuid: r.uuid,
      name: r.name,
      package: r.package,
      description: r.description,
      type: r.type,
    }))
  `);
}

// ─── Get Component Info ────────────────────────────────────────────

export function generateLibraryGetComponentInfo(params: {
  libraryUuid: string;
  type: string;
}): string {
  return buildExecuteBlock(`
    const info = await eda.lib_Library.getComponentInfo("${params.libraryUuid}", "${params.type}");
    info
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
  if (params.type === "component") {
    return buildExecuteBlock(`
      const comp = await eda.sch_PrimitiveComponent.create(
        { lx: ${params.lx}, ly: ${params.ly} },
        "${params.libraryUuid}"
      );
      if (${params.rotation}) comp.setRotation(${params.rotation});
      comp
    `);
  } else {
    return buildExecuteBlock(`
      const fp = await eda.pcb_PrimitiveComponent.create(
        { lx: ${params.lx}, ly: ${params.ly} },
        "${params.libraryUuid}"
      );
      if (${params.rotation}) fp.setRotation(${params.rotation});
      fp
    `);
  }
}

// ─── Screenshot ────────────────────────────────────────────────────

export function generateScreenshot(params: { tabId?: string }): string {
  const tabParam = params.tabId ? `"${params.tabId}"` : "undefined";
  return buildExecuteBlock(`
    const blob = await eda.dmt_EditorControl.getCurrentRenderedAreaImage(${tabParam});
    if (!blob) throw new Error("Failed to capture screenshot");
    // Return as base64 data URL
    const arr = new Uint8Array(await blob.arrayBuffer());
    let binary = '';
    for (let i = 0; i < arr.length; i++) {
      binary += String.fromCharCode(arr[i]);
    }
    "data:" + blob.type + ";base64," + btoa(binary)
  `);
}
