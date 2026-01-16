import { describe, it, expectTypeOf } from "bun:test";
import { defineMcpResource } from "../defineMcpResource";
import { buildMcpResourceResult } from "../result-builders";
import type { McpResourceResult } from "../types";

const emptyResult = buildMcpResourceResult();

describe("defineMcpResource", () => {
  describe("when no input schema is provided", () => {
    const resource = defineMcpResource({
      uri: "test://example",
      mimeType: "text/plain",
      handler: () => emptyResult,
    });

    it("should not include `input` in handler context", () => {
      expectTypeOf(resource).toMatchObjectType<{
        handler: (ctx: { uri: string }) => McpResourceResult;
      }>();
    });
  });
});
