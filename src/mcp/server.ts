import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  ExecuteEdaCodeSchema,
  EdaHealthSchema,
  EdaSelectWindowSchema,
  ProjectListSchema,
  ProjectOpenSchema,
  ProjectCreateSchema,
  SchematicListSchema,
  SchematicCreateSchema,
  PcbListSchema,
  PcbCreateSchema,
  DocumentOpenSchema,
  DocumentGetCurrentSchema,
  SchPlaceComponentSchema,
  SchPlaceWireSchema,
  SchPlaceNetlabelSchema,
  SchPlaceTextSchema,
  SchSelectSchema,
  SchGetSelectedSchema,
  SchDeleteSelectedSchema,
  SchMoveSchema,
  SchZoomToFitSchema,
  PcbPlaceFootprintSchema,
  PcbPlaceTrackSchema,
  PcbPlaceViaSchema,
  PcbPlaceCopperAreaSchema,
  PcbSelectSchema,
  PcbGetSelectedSchema,
  PcbDeleteSelectedSchema,
  PcbMoveSchema,
  LibrarySearchSchema,
  LibraryGetComponentInfoSchema,
  LibraryPlaceFromSearchSchema,
  EdaScreenshotSchema,
} from "./tools/tool-schema.js";
import {
  handleExecuteEdaCode,
  handleEdaHealth,
  handleEdaSelectWindow,
  handleProjectList,
  handleProjectOpen,
  handleProjectCreate,
  handleSchematicList,
  handleSchematicCreate,
  handlePcbList,
  handlePcbCreate,
  handleDocumentOpen,
  handleDocumentGetCurrent,
  handleSchPlaceComponent,
  handleSchPlaceWire,
  handleSchPlaceNetlabel,
  handleSchPlaceText,
  handleSchSelect,
  handleSchGetSelected,
  handleSchDeleteSelected,
  handleSchMove,
  handleSchZoomToFit,
  handlePcbPlaceFootprint,
  handlePcbPlaceTrack,
  handlePcbPlaceVia,
  handlePcbPlaceCopperArea,
  handlePcbSelect,
  handlePcbGetSelected,
  handlePcbDeleteSelected,
  handlePcbMove,
  handleLibrarySearch,
  handleLibraryGetComponentInfo,
  handleLibraryPlaceFromSearch,
  handleEdaScreenshot,
} from "./tools/index.js";

export function createMCPServer(): McpServer {
  const server = new McpServer(
    {
      name: "easyeda-mcp",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: { listChanged: true },
      },
    }
  );

  // ── General Control ──────────────────────────────────────────

  server.registerTool("execute_eda_code", {
    description:
      "Execute arbitrary JavaScript code in EasyEDA Pro. The 'eda' global provides access to all API modules. Use 'await' for async calls. Returns the result as JSON.",
    inputSchema: ExecuteEdaCodeSchema.shape,
  }, async (params) => {
    const result = await handleExecuteEdaCode(params);
    return { content: [{ type: "text", text: result }] };
  });

  server.registerTool("eda_health", {
    description:
      "Check bridge server status and EDA connection state. Returns whether bridge is running, connected window count, and active window ID.",
    inputSchema: EdaHealthSchema.shape,
  }, async () => {
    const result = handleEdaHealth();
    return { content: [{ type: "text", text: result }] };
  });

  server.registerTool("eda_select_window", {
    description:
      "Select the active EDA window when multiple EasyEDA instances are running.",
    inputSchema: EdaSelectWindowSchema.shape,
  }, async (params) => {
    const result = handleEdaSelectWindow(params);
    return { content: [{ type: "text", text: result }] };
  });

  // ── Project ──────────────────────────────────────────────────

  server.registerTool("project_list", {
    description: "List all projects in the current workspace.",
    inputSchema: ProjectListSchema.shape,
  }, async (params) => {
    const result = await handleProjectList(params);
    return { content: [{ type: "text", text: result }] };
  });

  server.registerTool("project_open", {
    description: "Open a project by its UUID.",
    inputSchema: ProjectOpenSchema.shape,
  }, async (params) => {
    const result = await handleProjectOpen(params);
    return { content: [{ type: "text", text: result }] };
  });

  server.registerTool("project_create", {
    description: "Create a new project.",
    inputSchema: ProjectCreateSchema.shape,
  }, async (params) => {
    const result = await handleProjectCreate(params);
    return { content: [{ type: "text", text: result }] };
  });

  // ── Schematic (Document) ─────────────────────────────────────

  server.registerTool("schematic_list", {
    description: "List all schematics in the current project.",
    inputSchema: SchematicListSchema.shape,
  }, async (params) => {
    const result = await handleSchematicList(params);
    return { content: [{ type: "text", text: result }] };
  });

  server.registerTool("schematic_create", {
    description: "Create a new schematic document.",
    inputSchema: SchematicCreateSchema.shape,
  }, async (params) => {
    const result = await handleSchematicCreate(params);
    return { content: [{ type: "text", text: result }] };
  });

  // ── PCB (Document) ───────────────────────────────────────────

  server.registerTool("pcb_list", {
    description: "List all PCB boards in the current project.",
    inputSchema: PcbListSchema.shape,
  }, async (params) => {
    const result = await handlePcbList(params);
    return { content: [{ type: "text", text: result }] };
  });

  server.registerTool("pcb_create", {
    description: "Create a new PCB board document.",
    inputSchema: PcbCreateSchema.shape,
  }, async (params) => {
    const result = await handlePcbCreate(params);
    return { content: [{ type: "text", text: result }] };
  });

  // ── Document ─────────────────────────────────────────────────

  server.registerTool("document_open", {
    description: "Open a document (schematic, PCB, library) by its UUID.",
    inputSchema: DocumentOpenSchema.shape,
  }, async (params) => {
    const result = await handleDocumentOpen(params);
    return { content: [{ type: "text", text: result }] };
  });

  server.registerTool("document_get_current", {
    description: "Get information about the currently active document.",
    inputSchema: DocumentGetCurrentSchema.shape,
  }, async () => {
    const result = await handleDocumentGetCurrent();
    return { content: [{ type: "text", text: result }] };
  });

  // ── Schematic Operations ─────────────────────────────────────

  server.registerTool("sch_place_component", {
    description: "Place a component from the library onto the schematic. Provide coordinates (lx, ly), library UUID, and optionally rotation and flip.",
    inputSchema: SchPlaceComponentSchema.shape,
  }, async (params) => {
    const result = await handleSchPlaceComponent(params);
    return { content: [{ type: "text", text: result }] };
  });

  server.registerTool("sch_place_wire", {
    description: "Draw a wire between two points (x1,y1) to (x2,y2) on the schematic.",
    inputSchema: SchPlaceWireSchema.shape,
  }, async (params) => {
    const result = await handleSchPlaceWire(params);
    return { content: [{ type: "text", text: result }] };
  });

  server.registerTool("sch_place_netlabel", {
    description: "Place a net label at the given coordinates with the specified text.",
    inputSchema: SchPlaceNetlabelSchema.shape,
  }, async (params) => {
    const result = await handleSchPlaceNetlabel(params);
    return { content: [{ type: "text", text: result }] };
  });

  server.registerTool("sch_place_text", {
    description: "Place a text annotation on the schematic.",
    inputSchema: SchPlaceTextSchema.shape,
  }, async (params) => {
    const result = await handleSchPlaceText(params);
    return { content: [{ type: "text", text: result }] };
  });

  server.registerTool("sch_select", {
    description: "Select a primitive at the given coordinates on the schematic.",
    inputSchema: SchSelectSchema.shape,
  }, async (params) => {
    const result = await handleSchSelect(params);
    return { content: [{ type: "text", text: result }] };
  });

  server.registerTool("sch_get_selected", {
    description: "Get information about currently selected primitives on the schematic.",
    inputSchema: SchGetSelectedSchema.shape,
  }, async (params) => {
    const result = await handleSchGetSelected(params);
    return { content: [{ type: "text", text: result }] };
  });

  server.registerTool("sch_delete_selected", {
    description: "Delete all currently selected primitives on the schematic.",
    inputSchema: SchDeleteSelectedSchema.shape,
  }, async (params) => {
    const result = await handleSchDeleteSelected(params);
    return { content: [{ type: "text", text: result }] };
  });

  server.registerTool("sch_move", {
    description: "Move selected primitives by (dx, dy) on the schematic.",
    inputSchema: SchMoveSchema.shape,
  }, async (params) => {
    const result = await handleSchMove(params);
    return { content: [{ type: "text", text: result }] };
  });

  server.registerTool("sch_zoom_to_fit", {
    description: "Zoom the schematic view to fit all primitives.",
    inputSchema: SchZoomToFitSchema.shape,
  }, async (params) => {
    const result = await handleSchZoomToFit(params);
    return { content: [{ type: "text", text: result }] };
  });

  // ── PCB Operations ───────────────────────────────────────────

  server.registerTool("pcb_place_footprint", {
    description: "Place a footprint from the library onto the PCB at the given coordinates.",
    inputSchema: PcbPlaceFootprintSchema.shape,
  }, async (params) => {
    const result = await handlePcbPlaceFootprint(params);
    return { content: [{ type: "text", text: result }] };
  });

  server.registerTool("pcb_place_track", {
    description: "Draw a track/route between two points on the PCB. Specify width in mils and layer (top/bottom).",
    inputSchema: PcbPlaceTrackSchema.shape,
  }, async (params) => {
    const result = await handlePcbPlaceTrack(params);
    return { content: [{ type: "text", text: result }] };
  });

  server.registerTool("pcb_place_via", {
    description: "Place a via at the given coordinates. Specify hole and pad sizes in mils.",
    inputSchema: PcbPlaceViaSchema.shape,
  }, async (params) => {
    const result = await handlePcbPlaceVia(params);
    return { content: [{ type: "text", text: result }] };
  });

  server.registerTool("pcb_place_copper_area", {
    description: "Create a copper pour area defined by a polygon of points.",
    inputSchema: PcbPlaceCopperAreaSchema.shape,
  }, async (params) => {
    const result = await handlePcbPlaceCopperArea(params);
    return { content: [{ type: "text", text: result }] };
  });

  server.registerTool("pcb_select", {
    description: "Select a primitive at the given coordinates on the PCB.",
    inputSchema: PcbSelectSchema.shape,
  }, async (params) => {
    const result = await handlePcbSelect(params);
    return { content: [{ type: "text", text: result }] };
  });

  server.registerTool("pcb_get_selected", {
    description: "Get information about currently selected primitives on the PCB.",
    inputSchema: PcbGetSelectedSchema.shape,
  }, async (params) => {
    const result = await handlePcbGetSelected(params);
    return { content: [{ type: "text", text: result }] };
  });

  server.registerTool("pcb_delete_selected", {
    description: "Delete all currently selected primitives on the PCB.",
    inputSchema: PcbDeleteSelectedSchema.shape,
  }, async (params) => {
    const result = await handlePcbDeleteSelected(params);
    return { content: [{ type: "text", text: result }] };
  });

  server.registerTool("pcb_move", {
    description: "Move selected primitives by (dx, dy) on the PCB.",
    inputSchema: PcbMoveSchema.shape,
  }, async (params) => {
    const result = await handlePcbMove(params);
    return { content: [{ type: "text", text: result }] };
  });

  // ── Library ──────────────────────────────────────────────────

  server.registerTool("library_search", {
    description: "Search for components, footprints, or symbols in the EasyEDA library. Returns matching items with UUID, name, package, and description.",
    inputSchema: LibrarySearchSchema.shape,
  }, async (params) => {
    const result = await handleLibrarySearch(params);
    return { content: [{ type: "text", text: result }] };
  });

  server.registerTool("library_get_component_info", {
    description: "Get detailed information about a specific library component by its UUID.",
    inputSchema: LibraryGetComponentInfoSchema.shape,
  }, async (params) => {
    const result = await handleLibraryGetComponentInfo(params);
    return { content: [{ type: "text", text: result }] };
  });

  server.registerTool("library_place_from_search", {
    description: "Place a component or footprint from library search results onto the schematic or PCB.",
    inputSchema: LibraryPlaceFromSearchSchema.shape,
  }, async (params) => {
    const result = await handleLibraryPlaceFromSearch(params);
    return { content: [{ type: "text", text: result }] };
  });

  // ── Screenshot ───────────────────────────────────────────────

  server.registerTool("eda_screenshot", {
    description: "Capture a screenshot of the current EasyEDA editor view. Returns a base64-encoded image data URL.",
    inputSchema: EdaScreenshotSchema.shape,
  }, async (params) => {
    const result = await handleEdaScreenshot(params);
    return { content: [{ type: "text", text: result }] };
  });

  return server;
}
