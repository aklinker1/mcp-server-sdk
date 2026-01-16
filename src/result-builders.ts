import type {
  McpAudioContent,
  McpImageContent,
  McpTextContent,
  McpToolResult,
  McpResultContent,
  McpResourceData,
  McpResourceContent,
  McpPromptMessage,
  McpResourceResult,
  McpPromptResult,
} from "./types";

export function buildMcpToolResult(
  ...content: McpResultContent[]
): McpToolResult {
  return {
    content,
    isError: false,
  };
}

export function buildMcpToolTextResult(text: string): McpToolResult {
  return buildMcpToolResult(buildMcpTextContent(text));
}

export async function buildMcpToolImageResult(
  data: Blob,
): Promise<McpToolResult> {
  return buildMcpToolResult(await buildMcpImageContent(data));
}

export async function buildMcpToolAudioResult(
  data: Blob,
): Promise<McpToolResult> {
  return buildMcpToolResult(await buildMcpAudioContent(data));
}

export function buildMcpTextContent(text: string): McpTextContent {
  return {
    type: "text",
    text,
  };
}

export async function buildMcpImageContent(
  data: Blob,
): Promise<McpImageContent> {
  return {
    type: "image",
    mimeType: data.type as any,
    data: await toBase64(data),
  };
}

export async function buildMcpAudioContent(
  data: Blob,
): Promise<McpAudioContent> {
  return {
    type: "audio",
    mimeType: data.type as any,
    data: await toBase64(data),
  };
}

export function buildMcpResourceContent(
  resource: McpResourceData,
): McpResourceContent {
  return {
    type: "resource",
    resource,
  };
}

export function buildMcpPromptMessage(
  role: "user" | "assistant",
  content: McpResultContent,
): McpPromptMessage {
  return {
    role,
    content,
  };
}

export function buildMcpResourceResult(
  ...contents: McpResourceData[]
): McpResourceResult {
  return {
    contents,
  };
}

export function buildMcpPromptResult(
  description: string,
  ...messages: McpPromptMessage[]
): McpPromptResult {
  return {
    description,
    messages,
  };
}

export async function buildMcpResourceData(
  uri: string,
  data: Blob | string,
  mimeType?: string,
): Promise<McpResourceData> {
  if (typeof data === "string") {
    return {
      uri,
      mimeType: mimeType ?? "text/plain",
      text: data,
    };
  }

  const type = mimeType ?? data.type;

  if (type.startsWith("text/")) {
    return {
      uri,
      mimeType: type,
      text: await data.text(),
    };
  } else {
    return {
      uri,
      mimeType: type,
      blob: await toBase64(data),
    };
  }
}

async function toBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}
