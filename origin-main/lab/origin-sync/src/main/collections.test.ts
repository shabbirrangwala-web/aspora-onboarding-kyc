import { describe, it, expect, beforeEach } from "vitest";
import { resetMock } from "../test/figma-mock";
import { findOrCreateCollection, ensureModes, findModeByName } from "./collections";

beforeEach(() => {
  resetMock();
});

describe("findOrCreateCollection", () => {
  it("creates a new collection when none exists", async () => {
    const col = await findOrCreateCollection("Primitives");
    expect(col).toBeDefined();
    expect(col.name).toBe("Primitives");
  });

  it("returns existing collection when name matches", async () => {
    const col1 = await findOrCreateCollection("Primitives");
    const col2 = await findOrCreateCollection("Primitives");
    expect(col1.id).toBe(col2.id);
  });

  it("sets hiddenFromPublishing when hidden option is true", async () => {
    const col = await findOrCreateCollection("_internal", { hidden: true });
    expect(col.hiddenFromPublishing).toBe(true);
  });

  it("updates hiddenFromPublishing on existing collection", async () => {
    const col1 = await findOrCreateCollection("Primitives");
    expect(col1.hiddenFromPublishing).toBe(false);
    const col2 = await findOrCreateCollection("Primitives", { hidden: true });
    expect(col2.hiddenFromPublishing).toBe(true);
  });
});

describe("ensureModes", () => {
  it("renames default mode to first name and adds second mode", async () => {
    const col = await findOrCreateCollection("Semantic Colors");
    const { lightModeId, darkModeId } = await ensureModes(col, "Light", "Dark");
    expect(lightModeId).toBe(col.defaultModeId);
    expect(darkModeId).toBeDefined();
    expect(darkModeId).not.toBe(lightModeId);
    expect(col.modes).toHaveLength(2);
    expect(col.modes[0].name).toBe("Light");
    expect(col.modes[1].name).toBe("Dark");
  });

  it("returns existing mode IDs when modes already exist", async () => {
    const col = await findOrCreateCollection("Semantic Colors");
    const first = await ensureModes(col, "Light", "Dark");
    const second = await ensureModes(col, "Light", "Dark");
    expect(second.lightModeId).toBe(first.lightModeId);
    expect(second.darkModeId).toBe(first.darkModeId);
    expect(col.modes).toHaveLength(2);
  });
});

describe("findModeByName", () => {
  it("finds a mode by name", async () => {
    const col = await findOrCreateCollection("Test");
    await ensureModes(col, "Light", "Dark");
    const modeId = findModeByName(col, "Dark");
    expect(modeId).toBeDefined();
    expect(modeId).not.toBeNull();
  });

  it("returns null for nonexistent mode name", async () => {
    const col = await findOrCreateCollection("Test");
    const modeId = findModeByName(col, "Nonexistent");
    expect(modeId).toBeNull();
  });
});
