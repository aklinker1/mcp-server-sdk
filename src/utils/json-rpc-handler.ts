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
import type { McpTool } from "../defineMcpTool";
import type { McpPrompt } from "../defineMcpPrompt";

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
          mapPrompts(options),
          RESOURCE_PAGE_SIZE,
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
        const prompt = getPrompt(options, promptName);

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
          mapResources(options),
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
        const resource = getResource(options, uri);
        return {
          jsonrpc: "2.0",
          id: request.id,
          result: await resource.handler({ uri }),
        };
      }

      // RESOURCE TEMPLATES
      case "resources/templates/list": {
        const { nextCursor, page } = paginate(
          mapResourceTemplates(options),
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
          mapTools(options),
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
        const toolName = request.params?.name as string | undefined;
        if (!toolName) throw Error();

        const tool = getTool(options, toolName);
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

function mapPrompts(options: CreateMcpFetchTransportOptions): any {
  return Object.entries(options.prompts ?? {}).map(([key, tool]) => ({
    name: tool.name ?? key,
    title: tool.title,
    description: tool.description,
    argsSchema: toJsonSchema(options, tool.argsSchema),
  }));
}

function mapTools(options: CreateMcpFetchTransportOptions): any {
  return Object.entries(options.tools ?? {}).map(([key, tool]) => ({
    name: tool.name ?? key,
    title: tool.title,
    description: tool.description,
    inputSchema: toJsonSchema(options, tool.inputSchema),
  }));
}

function isMcpResource(input: any): input is McpResource {
  return !!input?.uri;
}

function getResources(
  options: CreateMcpFetchTransportOptions,
): [key: string, resource: McpResource][] {
  let res: any[] = [];

  for (const [key, resource] of Object.entries(options.resources ?? {})) {
    if (!isMcpResource(resource)) continue;
    res.push([key, resource]);
  }

  return res;
}

function isMcpResourceTemplate(
  input: any,
): input is McpResourceTemplate<string, any> {
  return !!input?.uriTemplate;
}

function getResourceTemplates(
  options: CreateMcpFetchTransportOptions,
): [key: string, resource: McpResourceTemplate<string, any>][] {
  let res: any[] = [];

  for (const [key, resource] of Object.entries(options.resources ?? {})) {
    if (!isMcpResourceTemplate(resource)) continue;
    res.push([key, resource]);
  }

  return res;
}

function mapResourceTemplates(options: CreateMcpFetchTransportOptions): any {
  return getResourceTemplates(options).map(([key, resource]) => ({
    uriTemplate: resource.uriTemplate,
    name: resource.name ?? key,
    title: resource.title,
    description: resource.description,
    mimeType: resource.mimeType,
  }));
}

function mapResources(options: CreateMcpFetchTransportOptions): any {
  return getResources(options).map(([key, resource]) => ({
    uri: resource.uri,
    name: resource.name ?? key,
    title: resource.title,
    description: resource.description,
    mimeType: resource.mimeType,
  }));
}

function getTool(
  options: CreateMcpFetchTransportOptions,
  name: string,
): McpTool<StandardSchemaV1> {
  for (const [key, tool] of Object.entries(options.tools ?? {})) {
    if (tool.name === name || key === name) return tool;
  }

  throw Error("Tool not found");
}

function getResource(
  options: CreateMcpFetchTransportOptions,
  uri: string,
): McpResource {
  const resource = getResources(options).find(
    ([_, resource]) => resource.uri === uri,
  )?.[1];
  if (!resource) throw Error("TODO: Lookup resource templates URIs");

  return resource;
}

function getPrompt(
  options: CreateMcpFetchTransportOptions,
  name: string,
): McpPrompt<StandardSchemaV1> {
  for (const [key, prompt] of Object.entries(options.prompts ?? {})) {
    if (prompt.name === name || key === name) return prompt;
  }

  throw Error("Prompt not found");
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
