# EasyEDA MCP Server — Design Spec

**Date:** 2026-05-12
**Status:** Approved

## Overview

A TypeScript MCP (Model Context Protocol) server that bridges Claude Code with EasyEDA Pro (嘉立创EDA专业版), enabling AI-driven schematic capture, PCB layout, library management, and project operations.

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  easyeda-mcp (single TypeScript process)                          │
│                                                                  │
│  ┌─────────────────┐   ┌────────────────┐   ┌───────────────┐  │
│  │ MCP Transport    │   │ Tool Handlers  │   │ Code Generator│  │
│  │ (stdio)          │──►│ • project      │──►│ (params → JS) │  │
│  │                  │   │ • schematic    │   │               │  │
│  └────────┬─────────┘   │ • pcb          │   └───────┬───────┘  │
│           │             │ • library      │           │          │
│           │             │ • execute      │           │          │
│           │             └────────────────┘           │          │
│  ┌────────┴──────────────────────────────────────────┴────────┐ │
│  │  Internal Bridge (WebSocket Server + HTTP /health)         │ │
│  │  Port 49620-49629 auto-select, handshake, heartbeat        │ │
│  └───────────────────────┬────────────────────────────────────┘ │
└──────────────────────────┼──────────────────────────────────────┘
                           │  WebSocket
                    ┌──────┴───────┐
                    │  EasyEDA Client│
                    │  (run-api-gateway│
                    │   extension)    │
                    └──────────────┘
```

## Dependencies

- `@modelcontextprotocol/sdk` — MCP stdio transport
- `ws` — WebSocket server for bridge
- `zod` — Parameter validation & schema definition

## Project Structure

```
easyeda-mcp/
├── package.json
├── tsconfig.json
├── .mcp.json                  # Claude Code MCP config example
├── src/
│   ├── index.ts               # Entry: MCP Server + Bridge lifecycle
│   ├── mcp/
│   │   ├── server.ts          # MCP Server setup (name/version/tool registration)
│   │   └── tools/
│   │       ├── index.ts       # Tool registry
│   │       ├── project.ts     # project_* tools
│   │       ├── schematic.ts   # sch_* tools
│   │       ├── pcb.ts         # pcb_* tools
│   │       ├── library.ts     # library_* tools
│   │       ├── control.ts     # execute_eda_code, eda_* tools
│   │       └── tool-schema.ts # All Zod schemas
│   ├── bridge/
│   │   ├── server.ts          # WebSocket + HTTP server
│   │   ├── protocol.ts        # Protocol type definitions
│   │   └── port-finder.ts     # Port scanning & auto-selection
│   ├── codegen/
│   │   ├── builder.ts         # JS code string helpers
│   │   ├── project.ts         # Project codegen
│   │   ├── schematic.ts       # Schematic codegen
│   │   ├── pcb.ts             # PCB codegen
│   │   └── library.ts         # Library codegen
│   └── types/
│       └── easyeda.ts         # EasyEDA API type declarations
```

## MCP Tools

### Document Tree Management
- `project_list`, `project_open`, `project_create`
- `schematic_list`, `schematic_create`
- `pcb_list`, `pcb_create`
- `document_open`, `document_get_current`

### Schematic Operations
- `sch_place_component`, `sch_place_wire`, `sch_place_netlabel`, `sch_place_text`
- `sch_select`, `sch_get_selected`, `sch_delete_selected`, `sch_move`, `sch_zoom_to_fit`

### PCB Operations
- `pcb_place_footprint`, `pcb_place_track`, `pcb_place_via`, `pcb_place_copper_area`
- `pcb_select`, `pcb_get_selected`, `pcb_delete_selected`, `pcb_move`

### Library
- `library_search`, `library_get_component_info`, `library_place_from_search`

### General Control
- `execute_eda_code`, `eda_health`, `eda_select_window`, `eda_screenshot`

## Bridge Protocol

Compatible with `eext-run-api-gateway` extension:
- Port range: 49620-49629, auto-select available
- Handshake: `GET /health` returns `{ service: "easyeda-bridge" }`
- Message format: `{ type, id, code?, result?, error?, timestamp }`
- Types: `execute | result | error | ping | pong | handshake`
- Heartbeat: 15s interval, 5s timeout

## Implementation Phases

1. **Skeleton** — MCP + Bridge + `execute_eda_code` working
2. **Codegen + Project tools** — project_* tools
3. **Schematic tools** — sch_* tools
4. **PCB tools** — pcb_* tools
5. **Library + Screenshot** — library_* + eda_screenshot
6. **E2E verification** — real circuit design test

Estimated: ~1200-1500 lines TypeScript.
