import { buildExecuteBlock, parseExecuteResult } from "./builder.js";

// ─── Project ───────────────────────────────────────────────────────

export function generateProjectList(params: { teamUuid?: string; folderUuid?: string }): string {
  const filter = params.teamUuid
    ? `await eda.dmt_Project.getAllProjectsUuid("${params.teamUuid}", ${params.folderUuid ? `"${params.folderUuid}"` : "undefined"})`
    : `await eda.dmt_Project.getAllProjectsUuid()`;
  return buildExecuteBlock(`
    const uuids = ${filter};
    const results = [];
    for (const uuid of uuids) {
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

export function generateSchematicList(params: { projectUuid?: string }): string {
  return buildExecuteBlock(`
    const items = await eda.dmt_Schematic.getAllSchematicsInfo();
    items.map(i => ({
      uuid: i.uuid,
      name: i.name,
      pageCount: i.schematicPageCount,
    }))
  `);
}

export function generateSchematicCreate(params: { name?: string; parentUuid?: string }): string {
  const name = params.name ?? "New Schematic";
  return buildExecuteBlock(`await eda.dmt_Schematic.createSchematic("${name}")`);
}

// ─── PCB ───────────────────────────────────────────────────────────

export function generatePcbList(params: { projectUuid?: string }): string {
  return buildExecuteBlock(`
    const items = await eda.dmt_Pcb.getAllPcbsInfo();
    items.map(i => ({
      uuid: i.uuid,
      name: i.name,
    }))
  `);
}

export function generatePcbCreate(params: { name?: string }): string {
  const name = params.name ?? "New PCB";
  return buildExecuteBlock(`await eda.dmt_Pcb.createPcb("${name}")`);
}

// ─── Document ──────────────────────────────────────────────────────

export function generateDocumentOpen(params: { documentUuid: string }): string {
  return buildExecuteBlock(`await eda.dmt_EditorControl.openDocument("${params.documentUuid}")`);
}

export function generateDocumentGetCurrent(params: Record<string, never>): string {
  return buildExecuteBlock(`await eda.dmt_SelectControl.getCurrentDocumentInfo()`);
}
