import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { McpToolResult } from "./types";

/**
 * Object passed into the handler callback.
 *
 * If {@link McpTool#inputSchema} is defined, the object will include a `input` property.
 */
export type McpToolCtx<TInputSchema extends StandardSchemaV1 | undefined> =
  TInputSchema extends StandardSchemaV1
    ? {
        input: StandardSchemaV1.InferOutput<TInputSchema>;
      }
    : {};

/**
 * Object containing everything needed to provide a tool to MCP clients.
 */
export type McpTool<TInputSchema extends StandardSchemaV1 | undefined> = {
  name?: string;
  title?: string;
  description?: string;
  inputSchema?: TInputSchema;
  handler: (ctx: McpToolCtx<TInputSchema>) => McpToolResult;
};

/**
 * "Identity" function that helps define {@link McpTool} objects.
 *
 * Returns the value passed in without modification.
 */
export function defineMcpTool<
  TInputSchema extends StandardSchemaV1 | undefined = undefined,
>(tool: McpTool<TInputSchema>): McpTool<TInputSchema> {
  return tool;
}
