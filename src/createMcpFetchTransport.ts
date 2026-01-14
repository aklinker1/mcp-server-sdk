import type { CreateMcpFetchTransportOptions } from "./types";
import { handleJsonRpc, isJsonRpcRequest } from "./utils/json-rpc-handler";
import { buildTransportState } from "./utils/transport-state";

export type McpFetchFunction = (request: Request) => Promise<Response>;

export function createMcpFetchTransport(
  options: CreateMcpFetchTransportOptions,
): McpFetchFunction {
  const state = buildTransportState(options);

  const _sessions: { [sessionId: string]: WritableStreamDefaultController } =
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

    // Short-circuit preflight requests
    if (options.cors && request.method === "OPTIONS") {
      return new Response(undefined, { headers });
    }

    // Start a steaming session
    if (request.method === "GET") {
      return new Response("TODO - not implemented", { status: 501, headers });
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
        // TODO: Support individual requests
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
