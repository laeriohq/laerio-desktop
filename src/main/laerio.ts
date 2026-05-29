// L'AERIO bridge for the Hermes-fork desktop.
//
// Spawns the Python FastAPI sidecar (sidecar/main.py) at app start and reaps it
// at app quit, then exposes 4 IPC channels that proxy HTTP to localhost:5180.
// The sidecar is the ONLY thing that touches laerio.db; the renderer only sees
// JSON over IPC.
import { ChildProcess, spawn } from "child_process";
import { ipcMain } from "electron";
import * as path from "path";

const SIDECAR_BASE = "http://127.0.0.1:5180";

let sidecarProc: ChildProcess | null = null;

function sidecarDir(): string {
  // In dev, __dirname = .../out/main; the sidecar lives at <repo>/sidecar.
  // In prod-bundled the layout may differ; for MVP we trust the dev layout
  // and let prod packaging fix it later.
  return path.resolve(__dirname, "..", "..", "sidecar");
}

export function startLaerioSidecar(): void {
  if (sidecarProc) return;
  const cwd = sidecarDir();
  try {
    sidecarProc = spawn("python", ["main.py"], {
      cwd,
      stdio: "ignore",
      detached: false,
      windowsHide: true,
    });
    sidecarProc.on("exit", (code) => {
      console.log(`[laerio] sidecar exited code=${code}`);
      sidecarProc = null;
    });
    sidecarProc.on("error", (err) => {
      console.error(`[laerio] sidecar spawn error:`, err);
      sidecarProc = null;
    });
    console.log(`[laerio] sidecar spawned pid=${sidecarProc.pid} cwd=${cwd}`);
  } catch (err) {
    console.error(`[laerio] failed to start sidecar:`, err);
  }
}

export function stopLaerioSidecar(): void {
  if (!sidecarProc) return;
  try {
    if (process.platform === "win32") {
      // Soft-kill on Windows: SIGTERM works for Python's signal handlers.
      sidecarProc.kill("SIGTERM");
    } else {
      sidecarProc.kill("SIGINT");
    }
  } catch {
    /* ignore */
  }
  sidecarProc = null;
}

async function getJson(pathSuffix: string): Promise<unknown> {
  const resp = await fetch(`${SIDECAR_BASE}${pathSuffix}`);
  if (!resp.ok) {
    throw new Error(`sidecar ${resp.status}: ${await resp.text()}`);
  }
  return resp.json();
}

async function postJson(
  pathSuffix: string,
  body: Record<string, unknown>,
): Promise<unknown> {
  const resp = await fetch(`${SIDECAR_BASE}${pathSuffix}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    throw new Error(`sidecar ${resp.status}: ${await resp.text()}`);
  }
  return resp.json();
}

export function registerLaerioHandlers(): void {
  ipcMain.handle("laerio-health", async () => getJson("/health/stats"));

  ipcMain.handle(
    "laerio-brands-search",
    async (
      _event,
      args: {
        q?: string;
        tierMax?: number;
        niche?: string;
        limit?: number;
        offset?: number;
      } = {},
    ) => {
      const parts: string[] = [];
      if (args.q) parts.push(`q=${encodeURIComponent(args.q)}`);
      if (typeof args.tierMax === "number")
        parts.push(`tier_max=${args.tierMax}`);
      if (args.niche) parts.push(`niche=${encodeURIComponent(args.niche)}`);
      if (typeof args.limit === "number") parts.push(`limit=${args.limit}`);
      if (typeof args.offset === "number") parts.push(`offset=${args.offset}`);
      const qs = parts.length ? `?${parts.join("&")}` : "";
      return getJson(`/brands/search${qs}`);
    },
  );

  ipcMain.handle(
    "laerio-research-find",
    async (_event, args: { intent: string; topK?: number }) => {
      return postJson("/research/find", {
        intent: args.intent,
        top_k: args.topK ?? 20,
      });
    },
  );

  ipcMain.handle(
    "laerio-research-pitch",
    async (_event, args: { brandId: string; k?: number }) => {
      return postJson("/research/pitch", {
        brand_id: args.brandId,
        k: args.k ?? 5,
      });
    },
  );
}
