import type { CreateMcpFetchTransportOptions } from "./types";
import { handleJsonRpc, isJsonRpcRequest } from "./utils/json-rpc-handler";
import { buildTransportState } from "./utils/transport-state";

export type McpFetchFunction = (request: Request) => Promise<Response>;

/**
 * This builds a server-side fetch function
 * (`(request: Request) => MaybePromise<Response>`) that can be hosted by any
 * runtime that supports the WHATWG fetch standard.
 *
 * @example
 * ```ts
 * const fetch = createMcpFetchTransport({
 *   toJsonSchema: z.toJSONSchema,
 *   prompts: {
 *     // ...
 *   },
 *   resources: {
 *     // ...
 *   },
 *   tools: {
 *     // ...
 *   },
 * });
 * ```
 *
 */
export function createMcpFetchTransport(
  options: CreateMcpFetchTransportOptions,
): McpFetchFunction {
  const state = buildTransportState(options);

  const sessions: { [sessionId: string]: ReadableStreamDefaultController } =
    Object.create(null);

  return async (request) => {
    // Assign CORS Headers
    const headers = new Headers();
    if (options.cors) {
      headers.set(
        "Access-Control-Allow-Origin",
        options.cors === true ? "*" : options.cors.origin,
      );
      headers.set(
        "Access-Control-Allow-Methods",
        options.cors === true
          ? "GET,POST,OPTIONS"
          : options.cors.methods.join(","),
      );
      headers.set(
        "Access-Control-Allow-Headers",
        options.cors === true ? "*" : options.cors.headers.join(","),
      );
    }

    // Validate origin header - https://modelcontextprotocol.io/specification/draft/basic/transports#security-warning
    if (options.origin) {
      const originHeader = request.headers.get("origin");
      if (originHeader !== options.origin)
        return new Response(undefined, { status: 403, headers });
    }

    // Short-circuit preflight requests
    if (options.cors && request.method === "OPTIONS") {
      return new Response(undefined, { headers });
    }

    if (request.method === "POST") {
      const contentType = request.headers.get("content-type");
      if (contentType !== "application/json") {
        return Response.json(
          { message: "Invalid 'Content-Type' - only JSON is supported" },
          { status: 400, headers },
        );
      }

      const body = await request.json();
      if (!isJsonRpcRequest(body)) {
        return Response.json(
          { message: "Invalid JSON-RPC request" },
          { status: 400, headers },
        );
      }

      const accept = request.headers.get("accept");

      // Prefer event streams over one-off requests
      if (accept?.includes("text/event-stream")) {
        // TODO: Support SSE streams
      }

      if (accept?.includes("application/json")) {
        const result = await handleJsonRpc(options, state, body);
        if (result == null) return new Response(undefined, { headers });
        else return Response.json(result, { headers });
      }
    }

    // Unknown request, return 404
    return new Response(undefined, { status: 404, headers });
  };
}
