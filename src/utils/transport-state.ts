import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { McpPrompt } from "../defineMcpPrompt";
import type { McpResource } from "../defineMcpResource";
import type { McpResourceTemplate } from "../defineMcpResourceTemplate";
import type { McpTool } from "../defineMcpTool";
import type { CreateMcpFetchTransportOptions } from "../types";
import { isMcpResource } from "./resource-types";
import UriTemplate from "uri-template-lite";

export type ResolvedMcpTool = McpTool<StandardSchemaV1> & { name: string };
export type ResolvedMcpResource = {
  uri: string;
  resource: McpResource & { name: string };
};
export type ResolvedMcpResourceTemplate = {
  uriTemplate: UriTemplate;
  resource: McpResourceTemplate<string, StandardSchemaV1> & {
    name: string;
  };
};

export type TransportState = {
  tools: Record<string, ResolvedMcpTool>;
  resources: Array<ResolvedMcpResource | ResolvedMcpResourceTemplate>;
  prompts: Record<string, McpPrompt<StandardSchemaV1> & { name: string }>;
};

export function buildTransportState(
  options: CreateMcpFetchTransportOptions,
): TransportState {
  const prompts: TransportState["prompts"] = Object.entries(
    options.prompts ?? {},
  ).reduce((map, [key, prompt]) => {
    const name = prompt.name ?? key;
    map[name] = { ...prompt, name };
    return map;
  }, Object.create(null));

  const resources: TransportState["resources"] = Object.entries(
    options.resources ?? {},
  ).map<TransportState["resources"][number]>(([key, resource]) => {
    const name = resource.name ?? key;
    if (isMcpResource(resource)) {
      return {
        uri: resource.uri,
        resource: { ...resource, name },
      };
    } else {
      return {
        uriTemplate: new UriTemplate(resource.uriTemplate),
        resource: { ...resource, name },
      };
    }
  });

  const tools: TransportState["tools"] = Object.entries(
    options.tools ?? {},
  ).reduce((map, [key, tool]) => {
    const name = tool.name ?? key;
    map[name] = { ...tool, name };
    return map;
  }, Object.create(null));

  return {
    prompts,
    resources,
    tools,
  };
}
