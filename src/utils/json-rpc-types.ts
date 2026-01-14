/**
 * https://modelcontextprotocol.io/specification/draft/basic#requests
 */
export type JsonRpcRequest = {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: {
    [key: string]: unknown;
  };
};

/**
 * https://modelcontextprotocol.io/specification/draft/basic#result-responses
 */
export type JsonRpcResultResponse = {
  jsonrpc: "2.0";
  id: string | number;
  result: {
    [key: string]: unknown;
  };
};

/**
 * https://modelcontextprotocol.io/specification/draft/basic#error-responses
 */
export type JsonRpcErrorResponse = {
  jsonrpc: "2.0";
  id?: string | number;
  error: {
    code: number;
    message: string;
    data?: unknown;
  };
};

/**
 * https://modelcontextprotocol.io/specification/draft/basic#responses
 */
export type JsonRpcResponse = JsonRpcResultResponse | JsonRpcErrorResponse;

/**
 * https://modelcontextprotocol.io/specification/draft/basic#notifications
 */
export type JsonRpcNotification = {
  jsonrpc: "2.0";
  method: string;
  params?: {
    [key: string]: unknown;
  };
};

/**
 * https://json-rpc.dev/docs/reference/error-codes
 */
export enum JsonRpcErrorCode {
  // Standard Error Codes
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603,
  // Reserved Server Error Codes
  ServerError = -32000,
  ServerOverloaded = -32001,
  RateLimitExceeded = -32002,
  SessionExpired = -32003,
  MethodNotReady = -32004,
  // Implementation-Specific Errors
  InvalidBatchRequest = -32040,
  ContentTypeError = -32050,
  TransportError = -32060,
  TimeoutError = -32070,
}
