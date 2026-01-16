<div align="center">

# `@aklinker1/mcp-server-sdk`

[![JSR](https://jsr.io/badges/@aklinker1/mcp-server-sdk)](https://jsr.io/@aklinker1/mcp-server-sdk) [![NPM Version](https://img.shields.io/npm/v/%40aklinker1%2Fmcp-server-sdk?logo=npm&labelColor=red&color=white)](https://www.npmjs.com/package/@aklinker1/mcp-server-sdk) [![Docs](https://img.shields.io/badge/API%20Reference-blue?logo=readme&logoColor=white)](https://jsr.io/@aklinker1/mcp-server-sdk/doc) [![Install Size](https://pkg-size.dev/badge/install/61804)](https://pkg-size.dev/@aklinker1%2Fmcp-server-sdk)

</div>

Alternative to the official [`@modelcontextprotocol/sdk`](https://github.com/modelcontextprotocol/typescript-sdk/tree/v1.x) with:

- [Standard Schema compatible validation library](https://standardschema.dev/schema#what-schema-libraries-implement-the-spec) support
- [WHATWG `fetch` standard](https://fetch.spec.whatwg.org/) support (Bun & Deno servers)
- [Minimal dependencies](https://pkg-size.dev/@aklinker1%2Fmcp-server-sdk)

**Supported Protocol Versions**

| Protocol Version                                                       | Supported? |
| ---------------------------------------------------------------------- | :--------: |
| [2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25) |     ✅     |
| [2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18) |     ✅     |
| [2025-03-26](https://modelcontextprotocol.io/specification/2025-03-26) |     ✅     |
| [2024-11-05](https://modelcontextprotocol.io/specification/2024-11-05) |     ❌     |
| [draft](https://modelcontextprotocol.io/specification/draft)           |     ❌     |

**Supported Features**

| MCP Feature                                                                                                               | Supported? |
| ------------------------------------------------------------------------------------------------------------------------- | :--------: |
| [Transports > stdio](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports#stdio)                     |     ❌     |
| [Transports > Streamable HTTP](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports#streamable-http) |     ✅     |
| [Prompts](https://modelcontextprotocol.io/specification/2025-03-26/server/prompts)                                        |     ✅     |
| [Resources](https://modelcontextprotocol.io/specification/2025-03-26/server/resources)                                    |     ✅     |
| [Tools](https://modelcontextprotocol.io/specification/2025-03-26/server/tools)                                            |     ✅     |
| [Authorization](https://modelcontextprotocol.io/specification/2025-03-26/basic/authorization)                             |     ❌     |
| [Basic Utilities > Cancellation](https://modelcontextprotocol.io/specification/2025-03-26/basic/utilities/cancellation)   |     ❌     |
| [Basic Utilities > Ping](https://modelcontextprotocol.io/specification/2025-03-26/basic/utilities/ping)                   |     ✅     |
| [Basic Utilities > Progress](https://modelcontextprotocol.io/specification/2025-03-26/basic/utilities/progress)           |     ❌     |
| [Server Utilities > Completion](https://modelcontextprotocol.io/specification/2025-03-26/server/utilities/completion)     |     ❌     |
| [Server Utilities > Logging](https://modelcontextprotocol.io/specification/2025-03-26/server/utilities/logging)           |     ❌     |
| [Server Utilities > Pagination](https://modelcontextprotocol.io/specification/2025-03-26/server/utilities/pagination)     |     ❌     |

> Goal here is to create a generalized MCP `fetch` function that I can host in my homelab and use in chats that supports [Bun](https://bun.com).

## Installation

```sh
npm i @aklinker1/mcp-server-sdk
bun add @aklinker1/mcp-server-sdk
deno add @aklinker1/mcp-server-sdk
```

## Quick Start

```ts
// main.ts

import {
  createMcpFetchTransport,
  definePrompt,
  defineTool,
  defineResource,
} from "@aklinker1/mcp-server-sdk";
import z from "zod";

// Define your prompts, resources, and tools

const examplePrompt = definePrompt({
  argsSchema: z.object({
    param: z.string(),
  }),
  handler: async ({ args }) => {
    // ...
  },
});

const exampleResource = defineResource({
  uriTemplate: "example://{id}",
  uriSchema: z.object({
    id: z.string(),
  }),
  mimeType: "text/plain",
  handler: async ({ uri }) => {
    // ...
  },
});

const exampleTool = defineTool({
  inputSchema: z.object({
    param: z.string(),
  }),
  handler: async ({ input }) => {
    // ...
  },
});

// Create a server-side fetch function

const fetch = createMcpFetchTransport({
  toJsonSchema: z.toJSONSchema,
  prompts: {
    examplePrompt,
  },
  resources: {
    exampleResource,
  },
  tools: {
    exampleTool,
  },
});

// Serve the MCP server at http://localhost:3000

Bun.serve({ fetch });
// or
Deno.serve({ fetch });
```

Then run your server!

```sh
bun run main.ts
deno run --allow-net main.ts
```

## MCP Inspector

Use the `@modelcontextprotocol/inspector` package to inspec your server:

```sh
bunx @modelcontextprotocol/inspector@latest --transport http --server-url http://localhost:3000
```
