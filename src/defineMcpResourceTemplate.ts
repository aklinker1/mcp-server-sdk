import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * TODO: DOCUMENT
 */
export type McpResourceTemplateCtx<TUriSchema extends StandardSchemaV1> = {
  uri: string;
  uriParams: StandardSchemaV1.InferOutput<TUriSchema>;
};

/**
 * TODO: DOCUMENT
 */
export type McpResourceTemplateResponse = any; // TODO: Add response types

/**
 * TODO: DOCUMENT
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
  mimeType: string;
  handler: (
    ctx: McpResourceTemplateCtx<TUriSchema>,
  ) => McpResourceTemplateResponse;
};

/**
 * TODO: DOCUMENT
 *
 * @param prompt
 * @returns
 */
export function defineMcpResourceTemplate<
  TUriTemplate extends string,
  TUriSchema extends StandardSchemaV1,
>(
  prompt: McpResourceTemplate<TUriTemplate, TUriSchema>,
): McpResourceTemplate<TUriTemplate, TUriSchema> {
  return prompt;
}
