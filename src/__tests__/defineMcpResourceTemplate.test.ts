import { describe, it, expectTypeOf } from "bun:test";
import z from "zod";
import { defineMcpResourceTemplate } from "../defineMcpResourceTemplate";
import type { McpResourceResult } from "../types";
import { buildMcpResourceResult } from "../result-builder";

const emptyResult = buildMcpResourceResult();

describe("defineMcpResourceTemplate", () => {
  describe("when an input schema is provided", () => {
    const resource = defineMcpResourceTemplate({
      uriTemplate: "test://{flag}",
      uriSchema: z.object({
        flag: z.stringbool(),
      }),
      mimeType: "text/plain",
      handler: ({ uri: _uri, uriParams: _uriParams }) => emptyResult,
    });

    it("should infer the input type from the schema's output (validated) type", () => {
      expectTypeOf(resource).toMatchObjectType<{
        handler: (ctx: {
          uri: string;
          uriParams: { flag: boolean };
        }) => McpResourceResult;
      }>();
    });
  });
});
