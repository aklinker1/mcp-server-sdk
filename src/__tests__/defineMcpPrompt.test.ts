import { describe, it, expectTypeOf } from "bun:test";
import z from "zod";
import { defineMcpPrompt } from "../defineMcpPrompt";
import { buildMcpPromptResult } from "../result-builder";
import type { McpPromptResult } from "../types";

const emptyResult = buildMcpPromptResult("");

describe("defineMcpPrompt", () => {
  describe("when no input schema is provided", () => {
    const prompt = defineMcpPrompt({
      handler: () => emptyResult,
    });

    it("should not include `input` in handler context", () => {
      expectTypeOf(prompt).toMatchObjectType<{
        handler: (ctx: {}) => McpPromptResult;
      }>();
    });
  });

  describe("when an input schema is provided", () => {
    const prompt = defineMcpPrompt({
      argsSchema: z.object({
        flag: z.stringbool(),
      }),
      handler: ({ args: _ }) => emptyResult,
    });

    it("should infer the input type from the schema's output (validated) type", () => {
      expectTypeOf(prompt).toMatchObjectType<{
        handler: (ctx: { args: { flag: boolean } }) => McpPromptResult;
      }>();
    });
  });
});
