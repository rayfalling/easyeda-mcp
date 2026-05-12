import { executeCode } from "../../bridge/server.js";
import { parseExecuteResult } from "../../codegen/builder.js";
import {
  generateSchPlaceComponent,
  generateSchPlaceWire,
  generateSchPlaceNetlabel,
  generateSchPlaceText,
  generateSchSelect,
  generateSchGetSelected,
  generateSchDeleteSelected,
  generateSchMove,
  generateSchZoomToFit,
} from "../../codegen/schematic.js";

export async function handleSchPlaceComponent(params: {
  lx: number; ly: number; libraryUuid: string;
  rotation: number; flip: boolean; pageUuid?: string;
}): Promise<string> {
  const code = generateSchPlaceComponent(params);
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleSchPlaceWire(params: {
  x1: number; y1: number; x2: number; y2: number; pageUuid?: string;
}): Promise<string> {
  const code = generateSchPlaceWire(params);
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleSchPlaceNetlabel(params: {
  lx: number; ly: number; netName: string; rotation: number; pageUuid?: string;
}): Promise<string> {
  const code = generateSchPlaceNetlabel(params);
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleSchPlaceText(params: {
  lx: number; ly: number; text: string; rotation: number; height: number; pageUuid?: string;
}): Promise<string> {
  const code = generateSchPlaceText(params);
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleSchSelect(params: { lx: number; ly: number; pageUuid?: string }): Promise<string> {
  const code = generateSchSelect(params);
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleSchGetSelected(params: { pageUuid?: string }): Promise<string> {
  const code = generateSchGetSelected(params);
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleSchDeleteSelected(params: { pageUuid?: string }): Promise<string> {
  const code = generateSchDeleteSelected(params);
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleSchMove(params: { dx: number; dy: number; pageUuid?: string }): Promise<string> {
  const code = generateSchMove(params);
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}

export async function handleSchZoomToFit(params: { pageUuid?: string }): Promise<string> {
  const code = generateSchZoomToFit(params);
  const raw = await executeCode(code);
  return JSON.stringify(parseExecuteResult(raw), null, 2);
}
