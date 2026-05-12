import { createConnection } from "node:net";
import { get as httpGet } from "node:http";
import { PORT_START, PORT_END, SERVICE_ID } from "./protocol.js";

export async function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = createConnection({ port, host: "127.0.0.1" });
    socket.setTimeout(300);
    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.on("error", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

export async function isBridgeRunning(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = httpGet(
      `http://127.0.0.1:${port}/health`,
      { timeout: 800 },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            resolve(json.service === SERVICE_ID);
          } catch {
            resolve(false);
          }
        });
      }
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

export async function findExistingInstance(): Promise<number | null> {
  for (let port = PORT_START; port <= PORT_END; port++) {
    if (await isBridgeRunning(port)) return port;
  }
  return null;
}

export async function findAvailablePort(): Promise<number> {
  for (let port = PORT_START; port <= PORT_END; port++) {
    if (!(await isPortInUse(port))) return port;
  }
  throw new Error(`All ports in range ${PORT_START}-${PORT_END} are in use`);
}
