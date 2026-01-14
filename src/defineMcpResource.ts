/**
 * TODO: DOCUMENT
 */
export type McpResourceCtx = {
  uri: string;
};

/**
 * TODO: DOCUMENT
 */
export type McpResourceResponse = any; // TODO: Add response types

/**
 * TODO: DOCUMENT
 */
export type McpResource = {
  name?: string;
  title?: string;
  description?: string;
  uri: string;
  mimeType: string;
  handler: (ctx: McpResourceCtx) => McpResourceResponse;
};

/**
 * TODO: DOCUMENT
 *
 * @param prompt
 * @returns
 */
export function defineMcpResource(prompt: McpResource): McpResource {
  return prompt;
}
