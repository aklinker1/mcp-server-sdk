import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { McpResourceTemplate } from "../defineMcpResourceTemplate";
import type { McpResource } from "../defineMcpResource";

export function isMcpResource(input: any): input is McpResource {
  return !!input?.uri;
}

export function isMcpResourceTemplate(
  input: any,
): input is McpResourceTemplate<string, StandardSchemaV1> {
  return !!input?.uriTemplate;
}
