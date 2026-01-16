import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { McpPromptResult } from "./types";

/**
 * Object passed into the handler callback.
 *
 * If {@link McpPrompt#argsSchema} is defined, the object will include a `args` property.
 */
export type McpPromptCtx<TArgsSchema extends StandardSchemaV1 | undefined> =
  TArgsSchema extends StandardSchemaV1
    ? {
        args: StandardSchemaV1.InferOutput<TArgsSchema>;
      }
    : {};

/**
 * Object containing everything needed to provide a prompt to MCP clients.
 */
export type McpPrompt<TArgsSchema extends StandardSchemaV1 | undefined> = {
  name?: string;
  title?: string;
  description?: string;
  argsSchema?: TArgsSchema;
  handler: (ctx: McpPromptCtx<TArgsSchema>) => McpPromptResult;
};

/**
 * "Identity" function that helps define {@link McpPrompt} objects.
 *
 * Returns the value passed in without modification.
 */
export function defineMcpPrompt<
  TArgsSchema extends StandardSchemaV1 | undefined = undefined,
>(prompt: McpPrompt<TArgsSchema>): McpPrompt<TArgsSchema> {
  return prompt;
}
