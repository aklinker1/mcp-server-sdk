import z from "zod";
import {
  createMcpFetchTransport,
  defineMcpPrompt,
  defineMcpResource,
  defineMcpTool,
} from "./src";
import { defineMcpResourceTemplate } from "./src/defineMcpResourceTemplate";

const fetch = createMcpFetchTransport({
  toJsonSchema: z.toJSONSchema,
  prompts: {
    examplePrompt: defineMcpPrompt({
      handler: () => ({
        description: "Example prompt",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: "Hello world",
            },
          },
        ],
      }),
    }),
  },
  resources: {
    exampleResource: defineMcpResource({
      uri: "config://static",
      mimeType: "text/plain",
      handler: ({ uri }) => ({
        contents: [
          {
            uri,
            mimeType: "text/plain",
            text: "example static config",
          },
        ],
      }),
    }),
    exampleResourceTemplate: defineMcpResourceTemplate({
      uriTemplate: "config://{id}",
      uriSchema: z.object({
        id: z.string(),
      }),
      mimeType: "text/plain",
      handler: ({ uri, uriParams }) => ({
        contents: [
          {
            uri,
            mimeType: "text/plain",
            text: `Example resource template ${JSON.stringify(uriParams)}`,
          },
        ],
      }),
    }),
  },
  tools: {
    exampleTool: defineMcpTool({
      inputSchema: z.object({
        arg: z.string(),
      }),
      handler: ({ input }) => ({
        content: [
          {
            type: "text",
            text: "Example text response: " + input.arg,
          },
        ],
        isError: false,
      }),
    }),
  },
  cors: true,
});

Bun.serve({ fetch });
console.log(`Server started @ http://localhost:3000`);
