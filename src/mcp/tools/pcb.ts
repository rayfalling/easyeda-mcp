import { executeCode } from "../../bridge/server.js";
import { parseExecuteResult } from "../../codegen/builder.js";
import {
  generatePcbPlaceFootprint,
  generatePcbPlaceTrack,
  generatePcbPlaceVia,
  generatePcbPlaceCopperArea,
  generatePcbSelect,
  generatePcbGetSelected,
  generatePcbDeleteSelected,
  generatePcbMove,
} from "../../codegen/pcb.js";

export async function handlePcbPlaceFootprint(params: {
  lx: number; ly: number; libraryUuid: string;
  rotation: number; layer: string; pcbUuid?: string;
}): Promise<string> {
  const code = generatePcbPlaceFootprint(params);
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handlePcbPlaceTrack(params: {
  x1: number; y1: number; x2: number; y2: number;
  width: number; layer: string; pcbUuid?: string;
}): Promise<string> {
  const code = generatePcbPlaceTrack(params);
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handlePcbPlaceVia(params: {
  lx: number; ly: number; holeSize: number; padSize: number; pcbUuid?: string;
}): Promise<string> {
  const code = generatePcbPlaceVia(params);
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handlePcbPlaceCopperArea(params: {
  points: Array<{ x: number; y: number }>; layer: string; pcbUuid?: string;
}): Promise<string> {
  const code = generatePcbPlaceCopperArea(params);
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handlePcbSelect(params: { lx: number; ly: number; pcbUuid?: string }): Promise<string> {
  const code = generatePcbSelect(params);
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handlePcbGetSelected(params: { pcbUuid?: string }): Promise<string> {
  const code = generatePcbGetSelected(params);
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handlePcbDeleteSelected(params: { pcbUuid?: string }): Promise<string> {
  const code = generatePcbDeleteSelected(params);
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handlePcbMove(params: { dx: number; dy: number; pcbUuid?: string }): Promise<string> {
  const code = generatePcbMove(params);
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}
