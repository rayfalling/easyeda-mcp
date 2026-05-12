// EasyEDA API type declarations used by this project

export interface EDAWindow {
  windowId: string;
  connected: boolean;
  active: boolean;
}

export interface HealthResponse {
  service: string;
  status: string;
  edaConnected: boolean;
  edaWindowCount: number;
  activeWindowId: string | null;
  pendingRequests: number;
  timestamp: number;
}

export interface EDAWindowsResponse {
  windows: EDAWindow[];
  activeWindowId: string | null;
  count: number;
}

export interface ExecuteResponse {
  id: string;
  result?: unknown;
  error?: string;
  timestamp: number;
}
