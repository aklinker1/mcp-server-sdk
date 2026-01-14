import { describe, it, expectTypeOf } from "bun:test";
import z from "zod";
import { defineMcpPrompt, type McpPromptResponse } from "../defineMcpPrompt";

describe("defineMcpPrompt", () => {
  describe("when no input schema is provided", () => {
    const prompt = defineMcpPrompt({
      handler: () => {},
    });

    it("should not include `input` in handler context", () => {
      expectTypeOf(prompt).toMatchObjectType<{
        handler: (ctx: {}) => McpPromptResponse;
      }>();
    });
  });

  describe("when an input schema is provided", () => {
    const prompt = defineMcpPrompt({
      argsSchema: z.object({
        flag: z.stringbool(),
      }),
      handler: ({ args: _ }) => {},
    });

    it("should infer the input type from the schema's output (validated) type", () => {
      expectTypeOf(prompt).toMatchObjectType<{
        handler: (ctx: { args: { flag: boolean } }) => McpPromptResponse;
      }>();
    });
  });
});
