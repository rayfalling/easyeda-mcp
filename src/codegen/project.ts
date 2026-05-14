import { buildExecuteBlock } from "./builder.js";

// ─── Project ───────────────────────────────────────────────────────

export function generateProjectList(): string {
  return buildExecuteBlock(`
    const uuids = await eda.dmt_Project.getAllProjectsUuid();
    const results = [];
    for (const uuid of uuids.slice(0, 10)) {
      const info = await eda.dmt_Project.getProjectInfo(uuid);
      if (info) results.push(info);
    }
    results
  `);
}

export function generateProjectOpen(params: { projectUuid: string }): string {
  return buildExecuteBlock(`await eda.dmt_Project.openProject("${params.projectUuid}")`);
}

export function generateProjectCreate(params: {
  name: string;
  teamUuid?: string;
  folderUuid?: string;
  description?: string;
}): string {
  return buildExecuteBlock(
    `await eda.dmt_Project.createProject(` +
    `"${params.name}", ` +
    `undefined, ` +
    `${params.teamUuid ? `"${params.teamUuid}"` : "undefined"}, ` +
    `${params.folderUuid ? `"${params.folderUuid}"` : "undefined"}, ` +
    `${params.description ? `"${params.description}"` : "undefined"}` +
    `)`
  );
}

// ─── Schematic ─────────────────────────────────────────────────────

export function generateSchematicList(): string {
  return buildExecuteBlock(`
    const items = await eda.dmt_Schematic.getAllSchematicsInfo();
    items.map(i => ({ uuid: i.uuid, name: i.name, pageCount: i.schematicPageCount }))
  `);
}

export function generateSchematicCreate(params: { name?: string }): string {
  const name = params.name ?? "Schematic1";
  return buildExecuteBlock(`await eda.dmt_Schematic.createSchematic("${name}")`);
}

// ─── PCB ───────────────────────────────────────────────────────────

export function generatePcbList(): string {
  return buildExecuteBlock(`
    const items = await eda.dmt_Pcb.getAllPcbsInfo();
    items.map(i => ({ uuid: i.uuid, name: i.name }))
  `);
}

export function generatePcbCreate(params: { name?: string }): string {
  const name = params.name ?? "PCB1";
  return buildExecuteBlock(`await eda.dmt_Pcb.createPcb("${name}")`);
}

// ─── Document ──────────────────────────────────────────────────────

export function generateDocumentOpen(params: { documentUuid: string }): string {
  return buildExecuteBlock(`await eda.dmt_EditorControl.openDocument("${params.documentUuid}")`);
}

export function generateDocumentGetCurrent(): string {
  return buildExecuteBlock(`await eda.dmt_SelectControl.getCurrentDocumentInfo()`);
}
