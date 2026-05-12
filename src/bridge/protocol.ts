// Bridge protocol types — compatible with eext-run-api-gateway

export const SERVICE_ID = "easyeda-bridge";
export const PORT_START = 49620;
export const PORT_END = 49629;
export const REQUEST_TIMEOUT_MS = 30_000;
export const HEARTBEAT_INTERVAL_MS = 15_000;
export const HEARTBEAT_TIMEOUT_MS = 5_000;

export type MessageType = "execute" | "result" | "error" | "ping" | "pong" | "handshake" | "register";

export interface BridgeMessage {
  type: MessageType;
  id?: string;
  service?: string;
  clientType?: string;
  windowId?: string;
  code?: string;
  result?: unknown;
  error?: string;
  timestamp: number;
}

export interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}
