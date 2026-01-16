import { describe, it, expectTypeOf } from "bun:test";
import z from "zod";
import { defineMcpTool } from "../defineMcpTool";
import { buildMcpToolResult } from "../result-builders";
import type { McpToolResult } from "../types";

const emptyResult = buildMcpToolResult([]);

describe("defineMcpTool", () => {
  describe("when no input schema is provided", () => {
    const tool = defineMcpTool({
      handler: () => emptyResult,
    });

    it("should not include `input` in handler context", () => {
      expectTypeOf(tool).toMatchObjectType<{
        handler: (ctx: {}) => McpToolResult;
      }>();
    });
  });

  describe("when an input schema is provided", () => {
    const tool = defineMcpTool({
      inputSchema: z.object({
        flag: z.stringbool(),
      }),
      handler: ({ input: _ }) => emptyResult,
    });

    it("should infer the input type from the schema's output (validated) type", () => {
      expectTypeOf(tool).toMatchObjectType<{
        handler: (ctx: { input: { flag: boolean } }) => McpToolResult;
      }>();
    });
  });
});
