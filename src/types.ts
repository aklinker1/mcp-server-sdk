import type {
  StandardSchemaV1,
  StandardJSONSchemaV1,
} from "@standard-schema/spec";
import type { McpPrompt } from "./defineMcpPrompt";
import type { McpResource } from "./defineMcpResource";
import type { McpTool } from "./defineMcpTool";
import type { McpResourceTemplate } from "./defineMcpResourceTemplate";

export type CreateMcpFetchTransportOptions = {
  /**
   * When set, a 403 will be returned if the "Origin" header does not match the
   * provided value.
   */
  origin?: string;
  /**
   * Function from your validation library that converts a schema to it's JSON schema.
   *
   * @example
   * ```ts
   * import z from 'zod';
   *
   * const fetch = createMcpFetchTransport({
   *   toJsonSchema: z.toJSONSchema,
   *   // ...
   * })
   * ```
   */
  toJsonSchema: (schema: StandardSchemaV1) => StandardJSONSchemaV1;
  /**
   * Map of prompts defined with `defineMcpPrompt`.
   *
   * When a prompt doesn't have a `name`, the key it is listed as is used as it's `name`.
   */
  prompts?: Record<string, McpPrompt<any>>;
  /**
   * Map of resources defined with `defineMcpResource` or  `defineMcpResourceTemplate`.
   *
   * When a resource doesn't have a `name`, the key it is listed as is used as it's `name`.
   */
  resources?: Record<string, McpResource | McpResourceTemplate<string, any>>;
  /**
   * Map of tools defined with `defineMcpTool`.
   *
   * When a tool doesn't have a `name`, the key it is listed as is used as it's `name`.
   */
  tools?: Record<string, McpTool<any>>;
  /**
   * @see https://modelcontextprotocol.io/specification/draft/schema#initializeresult
   */
  serverInfo?: {
    name?: string;
    /**
     * Human display name.
     */
    title?: string;
    version?: string;
    description?: string;
    icons?: Array<{
      /**
       * @example "https://example.com/server-icon.svg"
       */
      src: string;
      /**
       * @example "image/svg+xml"
       */
      mimeType?: string;
      /**
       * @example ["any"]
       */
      sizes?: string[];
    }>;
    /**
     * @example "https://example.com/server"
     */
    websiteUrl?: string;
  };
  /**
   * Optional instructions for the client.
   */
  instructions?: string;
  /**
   * @see https://modelcontextprotocol.io/specification/draft/schema#servercapabilities
   */
  capabilities?: {
    experimental?: { [key: string]: object };
    logging?: object;
    completions?: object;
    prompts?: { listChanged?: boolean };
    resources?: { subscribe?: boolean; listChanged?: boolean };
    tools?: { listChanged?: boolean };
    tasks?: {
      list?: object;
      cancel?: object;
      requests?: { tools?: { call?: object } };
    };
  };
  /**
   * Whether or not to enable CORS inside the fetch function.
   *
   * - Set to `false` (the default) to disallow CORS
   * - Set to `true` to enable CORS, equivalent to:
   *    ```ts
   *    {
   *      origin: "*",
   *      methods: "GET,POST,OPTIONS",
   *      headers: "*"
   *    }
   *    ```
   * - Set to a custom object to customize the headers.
   *
   * @default false
   */
  cors?:
    | boolean
    | {
        /** Set as the `Access-Control-Allow-Origin` header */
        origin: string;
        /** Set as the `Access-Control-Allow-Methods` header */
        methods: string[];
        /** Set as the `Access-Control-Allow-Headers` header */
        headers: string[];
      };
};

/**
 * @see https://modelcontextprotocol.io/specification/2025-03-26/server/tools#text-content
 */
export type McpTextContent = {
  type: "text";
  text: string;
};

/**
 * @see https://modelcontextprotocol.io/specification/2025-03-26/server/tools#image-content
 */
export type McpImageContent = {
  type: "image";
  data: string;
  mimeType: string;
};

/**
 * @see https://modelcontextprotocol.io/specification/2025-03-26/server/tools#audio-content
 */
export type McpAudioContent = {
  type: "audio";
  data: string;
  mimeType: string;
};

/**
 * @see https://modelcontextprotocol.io/specification/2025-03-26/server/resources#text-content
 */
export type McpTextResourceData = {
  uri: string;
  mimeType: string;
  text: string;
};

/**
 * @see https://modelcontextprotocol.io/specification/2025-03-26/server/resources#binary-content
 */
export type McpBinaryResourceData = {
  uri: string;
  mimeType: string;
  blob: string;
};

/**
 * @see https://modelcontextprotocol.io/specification/2025-03-26/server/resources#resource-contents
 */
export type McpResourceData = McpTextResourceData | McpBinaryResourceData;

/**
 * @see https://modelcontextprotocol.io/specification/2025-03-26/server/tools#embedded-resources
 */
export type McpResourceContent = {
  type: "resource";
  resource: McpResourceData;
};

/**
 * @see https://modelcontextprotocol.io/specification/2025-03-26/server/tools#tool-result
 */
export type McpResultContent =
  | McpTextContent
  | McpImageContent
  | McpAudioContent
  | McpResourceContent;

export type McpPromptMessage = {
  role: "user" | "assistant";
  content: McpResultContent;
};

/**
 * @see https://modelcontextprotocol.io/specification/2025-03-26/server/tools#calling-tools
 */
export type McpToolResult = {
  content: McpResultContent[];
  isError: boolean;
};

/**
 * @see https://modelcontextprotocol.io/specification/2025-03-26/server/resources#reading-resources
 */
export type McpResourceResult = {
  contents: McpResourceData[];
};

/**
 * @see https://modelcontextprotocol.io/specification/2025-03-26/server/prompts#getting-a-prompt
 */
export type McpPromptResult = {
  description: string;
  messages: McpPromptMessage[];
};
