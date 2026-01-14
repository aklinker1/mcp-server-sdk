import type {
  StandardSchemaV1,
  StandardJSONSchemaV1,
} from "@standard-schema/spec";
import type { McpPrompt } from "./defineMcpPrompt";
import type { McpResource } from "./defineMcpResource";
import type { McpTool } from "./defineMcpTool";
import type { McpResourceTemplate } from "./defineMcpResourceTemplate";

export type CreateMcpFetchTransportOptions = {
  origin?: string;
  toJsonSchema: (schema: StandardSchemaV1) => StandardJSONSchemaV1;
  prompts?: Record<string, McpPrompt<any>>;
  resources?: Record<string, McpResource | McpResourceTemplate<string, any>>;
  tools?: Record<string, McpTool<any>>;
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
   * https://modelcontextprotocol.io/specification/draft/schema#servercapabilities
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
