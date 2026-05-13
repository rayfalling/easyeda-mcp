// Test script v4 — direct code execution, no buildExecuteBlock wrapping
const BASE = "http://127.0.0.1:49620";

async function test(name, code) {
  try {
    // Wrap in async IIFE — direct placement, no expression wrapping
    const safeCode = `(async () => {
      try {
${code.split('\n').map(l => '        ' + l.trim()).join('\n')}
      } catch (e) {
        return JSON.stringify({ ok: false, error: e?.message ?? String(e) });
      }
    })()`;
    const resp = await fetch(`${BASE}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: safeCode }),
    });
    const json = await resp.json();
    if (json.error) {
      console.log(`✗ ${name}: ${json.error.substring(0, 100)}`);
      return { ok: false, error: json.error };
    }
    // Parse the wrapped result
    const raw = json.result;
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.ok === false) {
          console.log(`✗ ${name}: ${parsed.error.substring(0, 100)}`);
          return { ok: false, error: parsed.error };
        }
        const val = parsed.value;
        const preview = typeof val === 'string' ? val.substring(0, 100) : JSON.stringify(val).substring(0, 100);
        console.log(`✓ ${name}: ${preview}`);
        return { ok: true };
      } catch {
        const preview = raw.length > 100 ? raw.substring(0, 100) + '...' : raw;
        console.log(`? ${name}: ${preview}`);
        return { ok: true };
      }
    }
    const preview = JSON.stringify(raw).substring(0, 100);
    console.log(`✓ ${name}: ${preview}`);
    return { ok: true };
  } catch (e) {
    console.log(`✗ ${name}: ${e.message}`);
    return { ok: false, error: e.message };
  }
}

async function waitForEda(timeoutSec = 30) {
  const start = Date.now();
  while (Date.now() - start < timeoutSec * 1000) {
    const resp = await fetch(`${BASE}/health`);
    const json = await resp.json();
    if (json.edaConnected) return true;
    await new Promise((r) => setTimeout(r, 2000));
  }
  return false;
}

async function main() {
  console.log("Waiting for EasyEDA connection...");
  if (!(await waitForEda())) { console.log("EDA not connected."); return; }
  console.log("Connected!\n");

  let pass = 0, fail = 0;

  // ── General Control ──────────────────────────────────────
  console.log("=== General Control ===");
  pass += (await test("eda_health", `"ok"`)).ok ? 1 : 0; fail += 1;
  pass += (await test("execute_eda_code", `1 + 2`)).ok ? 1 : 0; fail += 1;

  // ── Project & Document ───────────────────────────────────
  console.log("\n=== Project & Document ===");
  pass += (await test("project_current_info", `await eda.dmt_Project.getCurrentProjectInfo()`)).ok ? 1 : 0;
  pass += (await test("schematic_info", `
    const items = await eda.dmt_Schematic.getAllSchematicsInfo();
    items.map(i => ({uuid:i.uuid,name:i.name}))
  `)).ok ? 1 : 0;
  pass += (await test("schematic_page", `await eda.dmt_Schematic.getCurrentSchematicPageInfo()`)).ok ? 1 : 0;
  pass += (await test("pcb_info", `
    const items = await eda.dmt_Pcb.getAllPcbsInfo();
    items.map(i => ({uuid:i.uuid,name:i.name}))
  `)).ok ? 1 : 0;
  pass += (await test("document_current", `await eda.dmt_SelectControl.getCurrentDocumentInfo()`)).ok ? 1 : 0;

  // ── Library ──────────────────────────────────────────────
  console.log("\n=== Library ===");
  pass += (await test("lib_device_search", `
    const r = await eda.lib_Device.search("STM32F103C8T6", { limit: 3 });
    r.map(i => ({uuid:i.uuid||i.deviceUuid,name:i.name||i.deviceName}))
  `)).ok ? 1 : 0;
  pass += (await test("lib_footprint_search", `
    const r = await eda.lib_Footprint.search("0805", { limit: 3 });
    r.map(i => ({uuid:i.uuid,name:i.name}))
  `)).ok ? 1 : 0;

  // ── Schematic Operations ─────────────────────────────────
  console.log("\n=== Schematic Operations ===");
  pass += (await test("sch_get_components", `await eda.sch_PrimitiveComponent.getAll()`)).ok ? 1 : 0;
  pass += (await test("sch_get_wires", `await eda.sch_PrimitiveWire.getAll()`)).ok ? 1 : 0;
  pass += (await test("sch_get_texts", `await eda.sch_PrimitiveText.getAll()`)).ok ? 1 : 0;
  pass += (await test("sch_get_selected", `
    const s = await eda.sch_SelectControl.getSelectedPrimitives();
    ({count:s.length})
  `)).ok ? 1 : 0;
  pass += (await test("sch_zoom_to_fit", `await eda.dmt_EditorControl.zoomToAllPrimitives(); "ok"`)).ok ? 1 : 0;

  // ── PCB Operations ───────────────────────────────────────
  console.log("\n=== PCB Operations ===");
  pass += (await test("pcb_get_components", `await eda.pcb_PrimitiveComponent.getAll()`)).ok ? 1 : 0;
  pass += (await test("pcb_get_lines", `await eda.pcb_PrimitiveLine.getAll()`)).ok ? 1 : 0;
  pass += (await test("pcb_get_vias", `await eda.pcb_PrimitiveVia.getAll()`)).ok ? 1 : 0;

  // ── Write tests (CREATE + DELETE) ─────────────────────────
  console.log("\n=== Write Operations (create then delete) ===");

  // Create a text, verify, then delete it
  pass += (await test("sch_create_text", `
    const t = await eda.sch_PrimitiveText.create({lx:600,ly:500}, "TEST_MARKER");
    ({primitiveId:t.primitiveId, primitiveType:t.primitiveType, content:t.content})
  `)).ok ? 1 : 0;

  // Delete the test text
  pass += (await test("sch_delete_text", `
    const all = await eda.sch_PrimitiveText.getAll();
    let deleted = 0;
    for (const t of all) {
      if (t.content === "TEST_MARKER") {
        await eda.sch_PrimitiveText.delete(t.primitiveId);
        deleted++;
      }
    }
    ({deleted})
  `)).ok ? 1 : 0;

  // Create a wire, verify, then delete
  pass += (await test("sch_create_wire", `
    const w = await eda.sch_PrimitiveWire.create({
      lx:200, ly:600, to_lx:500, to_ly:600
    });
    ({primitiveId:w.primitiveId, primitiveType:w.primitiveType})
  `)).ok ? 1 : 0;

  // Select and delete the wire
  pass += (await test("sch_select_and_delete", `
    const wires = await eda.sch_PrimitiveWire.getAll();
    let deleted = 0;
    for (const w of wires) {
      // Delete all wires that have lx=200 (our test wires)
      if (w.line && w.line.length > 0) {
        const first = w.line[0];
        if (Math.abs(first.lx - 200) < 5) {
          await eda.sch_PrimitiveWire.delete(w.primitiveId);
          deleted++;
        }
      }
    }
    ({deleted})
  `)).ok ? 1 : 0;

  // Test select by coordinate
  pass += (await test("sch_select_coord", `
    await eda.sch_SelectControl.clearSelected();
    const comps = await eda.sch_PrimitiveComponent.getAll();
    if (comps.length > 0) {
      await eda.sch_SelectControl.doSelectPrimitives([comps[0]]);
      const sel = await eda.sch_SelectControl.getSelectedPrimitives();
      await eda.sch_SelectControl.clearSelected();
      return ({selected:sel.length>0, firstId:sel[0]?.primitiveId});
    }
    "no components on page"
  `)).ok ? 1 : 0;

  // ── Summary ──────────────────────────────────────────────
  console.log(`\n=== Results: ${pass} / ${pass + fail} pass ===`);
}

main().catch(console.error);
