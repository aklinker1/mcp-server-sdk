import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * Object passed into the handler callback.
 */
export type McpResourceTemplateCtx<TUriSchema extends StandardSchemaV1> = {
  /**
   * The URI the client is accessing.
   */
  uri: string;
  /**
   * Parsed URI containing any variables defined in the {@link McpResourceTemplate#uriSchema}.
   */
  uriParams: StandardSchemaV1.InferOutput<TUriSchema>;
};

/**
 * @see https://modelcontextprotocol.io/specification/draft/server/resources#resource-contents
 */
export type McpResourceTemplateResponse = any; // TODO: Add response types

/**
 * Object containing everything needed to provide a resource to MCP clients.
 */
export type McpResourceTemplate<
  TUriTemplate extends string,
  TUriSchema extends StandardSchemaV1,
> = {
  name?: string;
  title?: string;
  description?: string;
  uriTemplate: TUriTemplate;
  uriSchema: TUriSchema;
  mimeType?: string;
  handler: (
    ctx: McpResourceTemplateCtx<TUriSchema>,
  ) => McpResourceTemplateResponse;
};

/**
 * "Identity" function that helps define {@link McpResourceTemplate} objects.
 *
 * Returns the value passed in without modification.
 */
export function defineMcpResourceTemplate<
  TUriTemplate extends string,
  TUriSchema extends StandardSchemaV1,
>(
  prompt: McpResourceTemplate<TUriTemplate, TUriSchema>,
): McpResourceTemplate<TUriTemplate, TUriSchema> {
  return prompt;
}
