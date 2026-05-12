import { WebSocketServer, WebSocket } from "ws";
import { randomUUID } from "node:crypto";
import { createServer, IncomingMessage, ServerResponse } from "node:http";
import {
  SERVICE_ID,
  HEARTBEAT_INTERVAL_MS,
  HEARTBEAT_TIMEOUT_MS,
  REQUEST_TIMEOUT_MS,
  BridgeMessage,
  PendingRequest,
} from "./protocol.js";
import { findAvailablePort, findExistingInstance } from "./port-finder.js";

// ─── State ─────────────────────────────────────────────────────────
const edaClients = new Map<string, WebSocket>();
const pendingRequests = new Map<string, PendingRequest>();
let activeEdaWindowId: string | null = null;
let bridgePort: number | null = null;

// ─── Helpers ───────────────────────────────────────────────────────
function sendMessage(ws: WebSocket, msg: BridgeMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

function cancelPending(id: string, error: string): void {
  const pending = pendingRequests.get(id);
  if (pending) {
    clearTimeout(pending.timer);
    pendingRequests.delete(id);
    pending.reject(new Error(error));
  }
}

// ─── HTTP Server ───────────────────────────────────────────────────
async function handleHealth(_req: IncomingMessage, res: ServerResponse): Promise<void> {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      service: SERVICE_ID,
      status: "ok",
      edaConnected: edaClients.size > 0,
      edaWindowCount: edaClients.size,
      activeWindowId: activeEdaWindowId,
      pendingRequests: pendingRequests.size,
      timestamp: Date.now(),
    })
  );
}

async function handleEdaWindows(_req: IncomingMessage, res: ServerResponse): Promise<void> {
  const windows = [];
  for (const [windowId, ws] of edaClients) {
    windows.push({
      windowId,
      connected: ws.readyState === WebSocket.OPEN,
      active: windowId === activeEdaWindowId,
    });
  }
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      windows,
      activeWindowId: activeEdaWindowId,
      count: edaClients.size,
    })
  );
}

async function handleSelectWindow(body: string, res: ServerResponse): Promise<void> {
  try {
    const { windowId } = JSON.parse(body);
    if (!edaClients.has(windowId)) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: `EDA window "${windowId}" not found` }));
      return;
    }
    activeEdaWindowId = windowId;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, activeEdaWindowId }));
  } catch {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Invalid request body" }));
  }
}

async function handleExecute(body: string, res: ServerResponse): Promise<void> {
  try {
    const { code } = JSON.parse(body);
    if (!code || typeof code !== "string") {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Missing 'code' field" }));
      return;
    }

    const targetId = activeEdaWindowId;
    if (!targetId) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "No EDA window connected. Open EasyEDA Pro and install run-api-gateway extension." }));
      return;
    }

    const ws = edaClients.get(targetId);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: `EDA window "${targetId}" disconnected` }));
      return;
    }

    const id = randomUUID();
    const result = await new Promise<unknown>((resolve, reject) => {
      const timer = setTimeout(() => {
        pendingRequests.delete(id);
        reject(new Error(`Request ${id} timed out after ${REQUEST_TIMEOUT_MS}ms`));
      }, REQUEST_TIMEOUT_MS);

      pendingRequests.set(id, { resolve, reject, timer });
      sendMessage(ws, { type: "execute", id, code, timestamp: Date.now() });
    });

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ id, result, timestamp: Date.now() }));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: message, timestamp: Date.now() }));
  }
}

async function readBody(req: IncomingMessage): Promise<string> {
  let body = "";
  for await (const chunk of req) body += chunk;
  return body;
}

function createHttpServer(): ReturnType<typeof createServer> {
  return createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method === "GET" && req.url === "/health") return handleHealth(req, res);
    if (req.method === "GET" && req.url === "/eda-windows") return handleEdaWindows(req, res);

    if (req.method === "POST") {
      const body = await readBody(req);
      if (req.url === "/eda-windows/select") return handleSelectWindow(body, res);
      if (req.url === "/execute") return handleExecute(body, res);
    }

    res.writeHead(404);
    res.end();
  });
}

// ─── WebSocket ─────────────────────────────────────────────────────
function startHeartbeat(ws: WebSocket, windowId: string): NodeJS.Timeout {
  let heartbeatPending = false;

  const interval = setInterval(() => {
    if (heartbeatPending) {
      // Previous heartbeat not answered — disconnect
      edaClients.delete(windowId);
      if (activeEdaWindowId === windowId) activeEdaWindowId = null;
      ws.terminate();
      return;
    }
    heartbeatPending = true;
    sendMessage(ws, { type: "ping", id: randomUUID(), timestamp: Date.now() });
  }, HEARTBEAT_INTERVAL_MS);

  return interval;
}

function handleWSSConnection(ws: WebSocket): void {
  let windowId: string | null = null;
  let hbTimer: NodeJS.Timeout | null = null;

  // Send handshake with service identifier and client type
  sendMessage(ws, {
    type: "handshake",
    service: SERVICE_ID,
    clientType: "eda",
    timestamp: Date.now(),
  });

  ws.on("message", (raw) => {
    let msg: BridgeMessage;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    // EDA registration — responds with type "register" and windowId
    if (msg.type === "register" && msg.windowId) {
      windowId = msg.windowId;
      edaClients.set(windowId, ws);
      if (!activeEdaWindowId) activeEdaWindowId = windowId;
      if (hbTimer) clearInterval(hbTimer);
      hbTimer = startHeartbeat(ws, windowId);
      return;
    }

    // Result or error from EDA
    if (msg.type === "result" || msg.type === "error") {
      const pending = pendingRequests.get(msg.id ?? "");
      if (pending) {
        clearTimeout(pending.timer);
        pendingRequests.delete(msg.id ?? "");
        if (msg.type === "error") {
          pending.reject(new Error(msg.error ?? "Unknown EDA error"));
        } else {
          pending.resolve(msg.result);
        }
      }
    }

    // Pong — heartbeat acknowledged
    if (msg.type === "pong") {
      // handled by heartbeat interval
    }
  });

  ws.on("close", () => {
    if (hbTimer) clearInterval(hbTimer);
    if (windowId) {
      edaClients.delete(windowId);
      if (activeEdaWindowId === windowId) activeEdaWindowId = null;
    }
    for (const [id, pending] of pendingRequests) {
      cancelPending(id, "EDA window disconnected");
    }
  });

  ws.on("error", () => {
    if (hbTimer) clearInterval(hbTimer);
    if (windowId) {
      edaClients.delete(windowId);
      if (activeEdaWindowId === windowId) activeEdaWindowId = null;
    }
  });
}

// ─── Public API ────────────────────────────────────────────────────

export interface BridgeServer {
  port: number;
  health: string; // "http://127.0.0.1:{port}/health"
  execute: string; // "http://127.0.0.1:{port}/execute"
  close(): Promise<void>;
}

export async function startBridge(): Promise<BridgeServer> {
  // Check for existing instance first
  const existing = await findExistingInstance();
  if (existing !== null) {
    bridgePort = existing;
    return makeBridgeAPI(existing);
  }

  const port = await findAvailablePort();
  bridgePort = port;

  const httpServer = createHttpServer();
  const wss = new WebSocketServer({ server: httpServer });

  wss.on("connection", handleWSSConnection);

  await new Promise<void>((resolve) => {
    httpServer.listen(port, "127.0.0.1", resolve);
  });

  return makeBridgeAPI(port);
}

function makeBridgeAPI(port: number): BridgeServer {
  return {
    port,
    health: `http://127.0.0.1:${port}/health`,
    execute: `http://127.0.0.1:${port}/execute`,
    async close() {
      // Close all EDA connections
      for (const ws of edaClients.values()) ws.close();
      edaClients.clear();
      activeEdaWindowId = null;
      bridgePort = null;
    },
  };
}

/**
 * Execute code on the active EDA window via internal bridge (no HTTP round-trip).
 */
export async function executeCode(code: string): Promise<unknown> {
  const targetId = activeEdaWindowId;
  if (!targetId) {
    throw new Error("No EDA window connected. Open EasyEDA Pro and install run-api-gateway extension.");
  }

  const ws = edaClients.get(targetId);
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    throw new Error(`EDA window "${targetId}" disconnected`);
  }

  const id = randomUUID();
  return new Promise<unknown>((resolve, reject) => {
    const timer = setTimeout(() => {
      pendingRequests.delete(id);
      reject(new Error(`Request ${id} timed out after ${REQUEST_TIMEOUT_MS}ms`));
    }, REQUEST_TIMEOUT_MS);

    pendingRequests.set(id, { resolve, reject, timer });
    sendMessage(ws, { type: "execute", id, code, timestamp: Date.now() });
  });
}

export function getBridgeStatus() {
  return {
    running: bridgePort !== null,
    port: bridgePort,
    edaConnected: edaClients.size > 0,
    edaWindowCount: edaClients.size,
    activeWindowId: activeEdaWindowId,
  };
}

export function getEdaWindows() {
  const windows = [];
  for (const [windowId, ws] of edaClients) {
    windows.push({
      windowId,
      connected: ws.readyState === WebSocket.OPEN,
      active: windowId === activeEdaWindowId,
    });
  }
  return { windows, activeWindowId: activeEdaWindowId, count: edaClients.size };
}

export function selectEdaWindow(windowId: string): boolean {
  if (!edaClients.has(windowId)) return false;
  activeEdaWindowId = windowId;
  return true;
}
