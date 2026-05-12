import { z } from "zod";

// ─── Control tools ─────────────────────────────────────────────────

export const ExecuteEdaCodeSchema = z.object({
  code: z.string().describe("JavaScript code to execute in EasyEDA. Use 'await' for async API calls. The 'eda' global object provides access to all API modules."),
});

export const EdaHealthSchema = z.object({});

export const EdaSelectWindowSchema = z.object({
  windowId: z.string().describe("The EDA window ID to set as active"),
});

export const EdaScreenshotSchema = z.object({
  tabId: z.string().optional().describe("Tab ID to screenshot. Defaults to current active tab."),
});

// ─── Project tools ─────────────────────────────────────────────────

export const ProjectListSchema = z.object({
  teamUuid: z.string().optional().describe("Filter by team UUID"),
  folderUuid: z.string().optional().describe("Filter by folder UUID"),
});

export const ProjectOpenSchema = z.object({
  projectUuid: z.string().describe("The UUID of the project to open"),
});

export const ProjectCreateSchema = z.object({
  name: z.string().describe("Friendly name for the project"),
  teamUuid: z.string().optional().describe("Team UUID"),
  folderUuid: z.string().optional().describe("Parent folder UUID"),
  description: z.string().optional().describe("Project description"),
});

// ─── Schematic tools ───────────────────────────────────────────────

export const SchematicListSchema = z.object({
  projectUuid: z.string().optional().describe("Filter by project UUID. Defaults to current project."),
});

export const SchematicCreateSchema = z.object({
  name: z.string().optional().describe("Schematic name"),
  parentUuid: z.string().optional().describe("Parent PCB UUID"),
});

export const SchPlaceComponentSchema = z.object({
  lx: z.number().describe("X coordinate"),
  ly: z.number().describe("Y coordinate"),
  libraryUuid: z.string().describe("Library component UUID"),
  rotation: z.number().default(0).describe("Rotation angle in degrees (0, 90, 180, 270)"),
  flip: z.boolean().default(false).describe("Flip horizontally"),
  pageUuid: z.string().optional().describe("Schematic page UUID. Defaults to current page."),
});

export const SchPlaceWireSchema = z.object({
  x1: z.number().describe("Start X"),
  y1: z.number().describe("Start Y"),
  x2: z.number().describe("End X"),
  y2: z.number().describe("End Y"),
  pageUuid: z.string().optional(),
});

export const SchPlaceNetlabelSchema = z.object({
  lx: z.number().describe("X coordinate"),
  ly: z.number().describe("Y coordinate"),
  netName: z.string().describe("Net label text"),
  rotation: z.number().default(0).describe("Rotation angle"),
  pageUuid: z.string().optional(),
});

export const SchPlaceTextSchema = z.object({
  lx: z.number().describe("X coordinate"),
  ly: z.number().describe("Y coordinate"),
  text: z.string().describe("Text content"),
  rotation: z.number().default(0),
  height: z.number().default(60).describe("Text height in mils"),
  pageUuid: z.string().optional(),
});

export const SchSelectSchema = z.object({
  lx: z.number().describe("X coordinate of selection point"),
  ly: z.number().describe("Y coordinate of selection point"),
  pageUuid: z.string().optional(),
});

export const SchGetSelectedSchema = z.object({
  pageUuid: z.string().optional(),
});

export const SchDeleteSelectedSchema = z.object({
  pageUuid: z.string().optional(),
});

export const SchMoveSchema = z.object({
  dx: z.number().describe("Delta X to move"),
  dy: z.number().describe("Delta Y to move"),
  pageUuid: z.string().optional(),
});

export const SchZoomToFitSchema = z.object({
  pageUuid: z.string().optional(),
});

// ─── PCB tools ─────────────────────────────────────────────────────

export const PcbListSchema = z.object({
  projectUuid: z.string().optional(),
});

export const PcbCreateSchema = z.object({
  name: z.string().optional().describe("PCB board name"),
});

export const PcbPlaceFootprintSchema = z.object({
  lx: z.number().describe("X coordinate"),
  ly: z.number().describe("Y coordinate"),
  libraryUuid: z.string().describe("Footprint library UUID"),
  rotation: z.number().default(0).describe("Rotation in degrees"),
  layer: z.string().default("top").describe("Layer: top or bottom"),
  pcbUuid: z.string().optional(),
});

export const PcbPlaceTrackSchema = z.object({
  x1: z.number(), y1: z.number(),
  x2: z.number(), y2: z.number(),
  width: z.number().default(10).describe("Track width in mils"),
  layer: z.string().default("top").describe("Layer: top or bottom"),
  pcbUuid: z.string().optional(),
});

export const PcbPlaceViaSchema = z.object({
  lx: z.number(), ly: z.number(),
  holeSize: z.number().default(12).describe("Hole diameter in mils"),
  padSize: z.number().default(24).describe("Pad diameter in mils"),
  pcbUuid: z.string().optional(),
});

export const PcbPlaceCopperAreaSchema = z.object({
  points: z.array(z.object({ x: z.number(), y: z.number() })).describe("Polygon points for the copper pour"),
  layer: z.string().default("top"),
  pcbUuid: z.string().optional(),
});

export const PcbSelectSchema = z.object({
  lx: z.number(), ly: z.number(),
  pcbUuid: z.string().optional(),
});

export const PcbGetSelectedSchema = z.object({
  pcbUuid: z.string().optional(),
});

export const PcbDeleteSelectedSchema = z.object({
  pcbUuid: z.string().optional(),
});

export const PcbMoveSchema = z.object({
  dx: z.number(), dy: z.number(),
  pcbUuid: z.string().optional(),
});

// ─── Document tools ──────────────────────────────────────────────────

export const DocumentOpenSchema = z.object({
  documentUuid: z.string().describe("UUID of the document (schematic, PCB, or library) to open"),
});

export const DocumentGetCurrentSchema = z.object({});

// ─── Library tools ─────────────────────────────────────────────────

export const LibrarySearchSchema = z.object({
  keyword: z.string().describe("Search keyword"),
  type: z.enum(["component", "footprint", "symbol"]).default("component").describe("Library type to search"),
  limit: z.number().default(20).describe("Max results"),
});

export const LibraryGetComponentInfoSchema = z.object({
  libraryUuid: z.string().describe("Component library UUID"),
  type: z.enum(["component", "footprint", "symbol"]).default("component"),
});

export const LibraryPlaceFromSearchSchema = z.object({
  libraryUuid: z.string().describe("Component library UUID"),
  type: z.enum(["component", "footprint", "symbol"]).default("component"),
  lx: z.number().describe("X coordinate"),
  ly: z.number().describe("Y coordinate"),
  rotation: z.number().default(0),
  documentUuid: z.string().optional().describe("Target document UUID. Defaults to current."),
});
