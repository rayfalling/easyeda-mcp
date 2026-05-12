#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMCPServer } from "./mcp/server.js";
import { startBridge, BridgeServer } from "./bridge/server.js";

let bridge: BridgeServer | null = null;

async function main(): Promise<void> {
  // Start internal bridge
  bridge = await startBridge();
  console.error(`[easyeda-mcp] Bridge started on port ${bridge.port}`);
  console.error(`[easyeda-mcp] Health: ${bridge.health}`);

  // Create and connect MCP server
  const mcpServer = createMCPServer();
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);

  console.error("[easyeda-mcp] MCP server ready via stdio");
}

// Graceful shutdown
async function shutdown(): Promise<void> {
  console.error("[easyeda-mcp] Shutting down...");
  if (bridge) {
    await bridge.close();
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("unhandledRejection", (reason) => {
  console.error("[easyeda-mcp] Unhandled rejection:", reason);
});

main().catch((err) => {
  console.error("[easyeda-mcp] Fatal error:", err);
  process.exit(1);
});
