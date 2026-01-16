import type { McpResourceResult } from "./types";

/**
 * Object passed into the handler callback.
 */
export type McpResourceCtx = {
  /**
   * The URI the client is accessing.
   */
  uri: string;
};

/**
 * Object containing everything needed to provide a resource to MCP clients.
 */
export type McpResource = {
  name?: string;
  title?: string;
  description?: string;
  uri: string;
  mimeType?: string;
  handler: (ctx: McpResourceCtx) => McpResourceResult;
};

/**
 * "Identity" function that helps define {@link McpResource} objects.
 *
 * Returns the value passed in without modification.
 */
export function defineMcpResource(prompt: McpResource): McpResource {
  return prompt;
}
