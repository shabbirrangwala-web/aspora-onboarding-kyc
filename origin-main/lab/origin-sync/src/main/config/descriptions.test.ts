import { describe, it, expect } from "vitest";
import { getTokenDescription } from "./descriptions";

describe("Token Descriptions", () => {
  describe("brand colors with light pairing", () => {
    for (const color of ["maroon", "crimson", "teal", "blue"]) {
      it(`color.brand.${color} → Pair with on-brand/light`, () => {
        expect(getTokenDescription(`color.brand.${color}`)).toBe("Pair with on-brand/light");
      });
    }
  });

  describe("brand colors with dark pairing", () => {
    for (const color of ["peach", "gold", "lime"]) {
      it(`color.brand.${color} → Pair with on-brand/dark`, () => {
        expect(getTokenDescription(`color.brand.${color}`)).toBe("Pair with on-brand/dark");
      });
    }
  });

  it("radius.full returns description", () => {
    expect(getTokenDescription("radius.full")).toBe(
      "Fully rounded — produces pill/capsule shapes"
    );
  });

  it("unknown token returns undefined", () => {
    expect(getTokenDescription("color.brand.unknown")).toBeUndefined();
  });
});
