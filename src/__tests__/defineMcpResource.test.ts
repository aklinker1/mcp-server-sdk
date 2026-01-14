import { describe, it, expectTypeOf } from "bun:test";
import {
  defineMcpResource,
  type McpResourceResponse,
} from "../defineMcpResource";

describe("defineMcpResource", () => {
  describe("when no input schema is provided", () => {
    const resource = defineMcpResource({
      uri: "test://example",
      mimeType: "text/plain",
      handler: () => {},
    });

    it("should not include `input` in handler context", () => {
      expectTypeOf(resource).toMatchObjectType<{
        handler: (ctx: { uri: string }) => McpResourceResponse;
      }>();
    });
  });
});
