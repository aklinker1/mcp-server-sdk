import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { CreateMcpFetchTransportOptions } from "../types";
import { serializeError } from "./error-utils";
import {
  JsonRpcErrorCode,
  type JsonRpcRequest,
  type JsonRpcResponse,
} from "./json-rpc-types";
import type { McpResource } from "../defineMcpResource";
import type { McpResourceTemplate } from "../defineMcpResourceTemplate";
import { isMcpResource, isMcpResourceTemplate } from "./resource-types";
import type {
  ResolvedMcpResource,
  ResolvedMcpResourceTemplate,
  TransportState,
} from "./transport-state";

const TOOL_PAGE_SIZE = 50;
const PROMPT_PAGE_SIZE = 20;
const RESOURCE_PAGE_SIZE = 20;

const SUPPORTED_PROTOCOL_VERSIONS = [
  // "2025-11-25",
  // "2025-06-18",
  "2025-03-26",
];

export async function handleJsonRpc(
  options: CreateMcpFetchTransportOptions,
  state: TransportState,
  request: JsonRpcRequest,
): Promise<JsonRpcResponse | null> {
  try {
    switch (request.method) {
      case "initialize": {
        return {
          jsonrpc: "2.0",
          id: request.id,
          result: {
            protocolVersion: negotiateVersion(
              request.params!.protocolVersion as string,
            ),
            capabilities: negotiateCapabilities(
              request.params!.capabilities,
              options,
            ),
            serverInfo: {
              ...options.serverInfo,
              name: options.serverInfo?.name ?? "mcp_server",
              version: options.serverInfo?.version ?? "1.0.0",
            },
          },
        };
      }
      case "ping": {
        return {
          jsonrpc: "2.0",
          id: request.id,
          result: {},
        };
      }

      // NOTIFICATIONS
      case "notifications/initialized": {
        return null;
      }

      // PROMPTS
      case "prompts/list": {
        const { nextCursor, page } = paginate(
          mapPrompts(options, state),
          PROMPT_PAGE_SIZE,
          request.params?.cursor,
        );
        return {
          jsonrpc: "2.0",
          id: request.id,
          result: {
            prompts: page,
            nextCursor,
          },
        };
      }
      case "prompts/get": {
        const promptName = request.params?.name as string;
        const prompt = state.prompts[promptName];
        if (!prompt) throw Error("Prompt not found");

        const args = await validateSchema(
          prompt.argsSchema,
          request.params?.arguments,
        );

        return {
          jsonrpc: "2.0",
          id: request.id,
          result: await prompt.handler({ args }),
        };
      }

      // RESOURCES
      case "resources/list": {
        const { nextCursor, page } = paginate(
          mapResources(state),
          RESOURCE_PAGE_SIZE,
          request.params?.cursor,
        );
        return {
          jsonrpc: "2.0",
          id: request.id,
          result: {
            resources: page,
            nextCursor,
          },
        };
      }
      case "resources/read": {
        const uri = request.params!.uri as string;
        const { resource, uriParams } = getResource(state, uri);
        return {
          jsonrpc: "2.0",
          id: request.id,
          result: await resource.handler({ uri, uriParams }),
        };
      }

      // RESOURCE TEMPLATES
      case "resources/templates/list": {
        const { nextCursor, page } = paginate(
          mapResourceTemplates(state),
          RESOURCE_PAGE_SIZE,
          request.params?.cursor,
        );
        return {
          jsonrpc: "2.0",
          id: request.id,
          result: {
            resourceTemplates: page,
            nextCursor,
          },
        };
      }

      // TOOLS
      case "tools/list": {
        const { nextCursor, page } = paginate(
          mapTools(options, state),
          TOOL_PAGE_SIZE,
          request.params?.cursor,
        );
        return {
          jsonrpc: "2.0",
          id: request.id,
          result: {
            tools: page,
            nextCursor,
          },
        };
      }
      case "tools/call": {
        const toolName = request.params?.name as string;
        const tool = state.tools[toolName];
        if (!tool) throw Error("Tool not found");

        const input = await validateSchema(
          tool.inputSchema,
          request.params?.arguments,
        );

        return {
          jsonrpc: "2.0",
          id: request.id,
          result: await tool.handler({ input }),
        };
      }

      // METHOD NOT FOUND
      default: {
        return {
          jsonrpc: "2.0",
          id: request.id,
          error: {
            code: JsonRpcErrorCode.MethodNotFound,
            message: "Method not found",
            data: request,
          },
        };
      }
    }
  } catch (err) {
    return {
      jsonrpc: "2.0",
      id: request.id,
      error: {
        code: JsonRpcErrorCode.ServerError,
        message: "Server error",
        data: serializeError(err),
      },
    };
  }
}

export function isJsonRpcRequest(body: any): body is JsonRpcRequest {
  return body?.jsonrpc === "2.0" && typeof body?.method === "string";
}
/**
 * https://modelcontextprotocol.io/specification/draft/basic/lifecycle#version-negotiation
 */
function negotiateVersion(_clientVersion: string): string {
  return SUPPORTED_PROTOCOL_VERSIONS[0]!;
}

function negotiateCapabilities(
  _clientCapabilities: any,
  options: CreateMcpFetchTransportOptions,
): any {
  return {
    ...options.capabilities,
    tools: options.capabilities?.tools ?? (options.tools ? {} : undefined),
    prompts:
      options.capabilities?.prompts ?? (options.prompts ? {} : undefined),
    resources:
      options.capabilities?.resources ?? (options.resources ? {} : undefined),
  };
}

function paginate<T>(items: T[], pageSize: number, cursor?: string | unknown) {
  const startIndex = Number(cursor ?? "0");
  const endIndex = startIndex + pageSize;
  return {
    page: items.slice(startIndex, endIndex),
    nextCursor: endIndex < items.length ? String(endIndex) : undefined,
  };
}

function mapPrompts(
  options: CreateMcpFetchTransportOptions,
  state: TransportState,
): any {
  return Object.values(state.prompts).map((tool) => ({
    name: tool.name,
    title: tool.title,
    description: tool.description,
    argsSchema: toJsonSchema(options, tool.argsSchema),
  }));
}

function mapTools(
  options: CreateMcpFetchTransportOptions,
  state: TransportState,
): any {
  return Object.values(state.tools).map((tool) => ({
    name: tool.name,
    title: tool.title,
    description: tool.description,
    inputSchema: toJsonSchema(options, tool.inputSchema),
  }));
}

function getResources(state: TransportState): ResolvedMcpResource[] {
  return state.resources.filter(({ resource }) =>
    isMcpResource(resource),
  ) as ResolvedMcpResource[];
}

function getResourceTemplates(
  state: TransportState,
): ResolvedMcpResourceTemplate[] {
  return state.resources.filter(({ resource }) =>
    isMcpResourceTemplate(resource),
  ) as ResolvedMcpResourceTemplate[];
}

function mapResourceTemplates(state: TransportState): any {
  return getResourceTemplates(state).map(({ resource }) => ({
    uriTemplate: resource.uriTemplate,
    name: resource.name,
    title: resource.title,
    description: resource.description,
    mimeType: resource.mimeType,
  }));
}

function mapResources(state: TransportState): any {
  return getResources(state).map(({ resource }) => ({
    uri: resource.uri,
    name: resource.name,
    title: resource.title,
    description: resource.description,
    mimeType: resource.mimeType,
  }));
}

function getResource(
  state: TransportState,
  uri: string,
):
  | { resource: McpResource; uriParams: undefined }
  | {
      resource: McpResourceTemplate<string, StandardSchemaV1>;
      uriParams: any;
    } {
  for (const entry of state.resources) {
    if ("uri" in entry) {
      if (uri === entry.uri)
        return { resource: entry.resource, uriParams: undefined };
    } else {
      const uriParams = entry.uriTemplate.match(uri);
      if (uriParams) return { resource: entry.resource, uriParams };
    }
  }
  throw Error("URI not found");
}

async function validateSchema<T>(
  schema: StandardSchemaV1<T> | undefined,
  value: unknown,
): Promise<any> {
  if (schema == null) return undefined;

  const validated = await schema["~standard"].validate(value);
  if (validated.issues)
    throw Error("Validation error", { cause: validated.issues });

  return validated.value;
}

function toJsonSchema(
  options: CreateMcpFetchTransportOptions,
  schema: StandardSchemaV1 | undefined,
): any {
  if (schema == null) return { type: "object", properties: {}, required: [] };

  return options.toJsonSchema(schema);
}
