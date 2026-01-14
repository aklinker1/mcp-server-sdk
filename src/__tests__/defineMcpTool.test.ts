import { describe, it, expectTypeOf } from "bun:test";
import z from "zod";
import { defineMcpTool, type McpToolResponse } from "../defineMcpTool";

describe("defineMcpTool", () => {
  describe("when no input schema is provided", () => {
    const tool = defineMcpTool({
      handler: () => {},
    });

    it("should not include `input` in handler context", () => {
      expectTypeOf(tool).toMatchObjectType<{
        handler: (ctx: {}) => McpToolResponse;
      }>();
    });
  });

  describe("when an input schema is provided", () => {
    const tool = defineMcpTool({
      inputSchema: z.object({
        flag: z.stringbool(),
      }),
      handler: ({ input: _ }) => {},
    });

    it("should infer the input type from the schema's output (validated) type", () => {
      expectTypeOf(tool).toMatchObjectType<{
        handler: (ctx: { input: { flag: boolean } }) => McpToolResponse;
      }>();
    });
  });
});
