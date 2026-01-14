import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * TODO: DOCUMENT
 */
export type McpPromptCtx<TArgsSchema extends StandardSchemaV1 | undefined> =
  TArgsSchema extends StandardSchemaV1
    ? {
        args: StandardSchemaV1.InferOutput<TArgsSchema>;
      }
    : {};

/**
 * TODO: DOCUMENT
 */
export type McpPromptResponse = any; // TODO: Add response types

/**
 * TODO: DOCUMENT
 */
export type McpPrompt<TArgsSchema extends StandardSchemaV1 | undefined> = {
  name?: string;
  title?: string;
  description?: string;
  argsSchema?: TArgsSchema;
  handler: (ctx: McpPromptCtx<TArgsSchema>) => McpPromptResponse;
};

/**
 * TODO: DOCUMENT
 *
 * @param prompt
 * @returns
 */
export function defineMcpPrompt<
  TArgsSchema extends StandardSchemaV1 | undefined = undefined,
>(prompt: McpPrompt<TArgsSchema>): McpPrompt<TArgsSchema> {
  return prompt;
}
