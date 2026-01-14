import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * TODO: DOCUMENT
 */
export type McpToolCtx<TInputSchema extends StandardSchemaV1 | undefined> =
  TInputSchema extends StandardSchemaV1
    ? {
        input: StandardSchemaV1.InferOutput<TInputSchema>;
      }
    : {};

/**
 * TODO: DOCUMENT
 */
export type McpToolResponse = any; // TODO: Add response types

/**
 * TODO: DOCUMENT
 */
export type McpTool<TInputSchema extends StandardSchemaV1 | undefined> = {
  name?: string;
  title?: string;
  description?: string;
  inputSchema?: TInputSchema;
  handler: (ctx: McpToolCtx<TInputSchema>) => McpToolResponse;
};

/**
 * TODO: DOCUMENT
 *
 * @param tool
 * @returns
 */
export function defineMcpTool<
  TInputSchema extends StandardSchemaV1 | undefined = undefined,
>(tool: McpTool<TInputSchema>): McpTool<TInputSchema> {
  return tool;
}
