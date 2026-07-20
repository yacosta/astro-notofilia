import { json, corsOptions } from './_lib/json.js';

const SERVER_INFO = {
  name: 'notofilia',
  version: '1.0.0',
  title: 'Notofilia MCP',
};

const TOOLS = [
  {
    name: 'search_catalog',
    description:
      'Search Notofilia catalog pages (historical banknotes and coins) by free-text query.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search text (title, path, keywords)' },
        limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_site_info',
    description: 'Return high-level information about Notofilia and agent discovery endpoints.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'health_check',
    description: 'Check whether the Notofilia agent APIs are healthy.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

async function searchCatalog(origin, query, limit = 10) {
  const url = new URL('/api/catalog', origin);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', String(limit));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`catalog search failed: ${res.status}`);
  return res.json();
}

async function handleToolCall(name, args, origin) {
  if (name === 'search_catalog') {
    const data = await searchCatalog(origin, args.query || '', args.limit || 10);
    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      structuredContent: data,
    };
  }
  if (name === 'get_site_info') {
    const info = {
      name: 'Notofilia',
      url: 'https://www.notofilia.com',
      description:
        'Digital catalog and virtual collection of historical banknotes and coins.',
      discovery: {
        apiCatalog: 'https://www.notofilia.com/.well-known/api-catalog',
        mcpServerCard: 'https://www.notofilia.com/.well-known/mcp/server-card.json',
        authMd: 'https://www.notofilia.com/auth.md',
        openapi: 'https://www.notofilia.com/openapi.json',
        agentIndex: 'https://www.notofilia.com/.well-known/agent-index.json',
      },
    };
    return {
      content: [{ type: 'text', text: JSON.stringify(info, null, 2) }],
      structuredContent: info,
    };
  }
  if (name === 'health_check') {
    const res = await fetch(new URL('/api/health', origin));
    const data = await res.json();
    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      structuredContent: data,
    };
  }
  return {
    content: [{ type: 'text', text: `Unknown tool: ${name}` }],
    isError: true,
  };
}

function rpcResult(id, result) {
  return { jsonrpc: '2.0', id: id ?? null, result };
}

function rpcError(id, code, message) {
  return { jsonrpc: '2.0', id: id ?? null, error: { code, message } };
}

async function handleMessage(message, origin) {
  if (!message || message.jsonrpc !== '2.0') {
    return rpcError(null, -32600, 'Invalid Request');
  }
  const { id, method, params } = message;

  if (method === 'initialize') {
    return rpcResult(id, {
      protocolVersion: params?.protocolVersion || '2025-03-26',
      capabilities: { tools: {} },
      serverInfo: SERVER_INFO,
      instructions:
        'Notofilia MCP exposes read-only catalog search and site discovery tools.',
    });
  }
  if (method === 'notifications/initialized' || method === 'initialized') {
    return null;
  }
  if (method === 'ping') {
    return rpcResult(id, {});
  }
  if (method === 'tools/list') {
    return rpcResult(id, { tools: TOOLS });
  }
  if (method === 'tools/call') {
    try {
      const result = await handleToolCall(params?.name, params?.arguments || {}, origin);
      return rpcResult(id, result);
    } catch (error) {
      return rpcResult(id, {
        content: [{ type: 'text', text: String(error?.message || error) }],
        isError: true,
      });
    }
  }
  return rpcError(id, -32601, `Method not found: ${method}`);
}

export async function onRequestOptions() {
  return corsOptions();
}

export async function onRequestGet() {
  return json({
    name: SERVER_INFO.name,
    version: SERVER_INFO.version,
    transport: 'streamable-http',
    endpoints: {
      mcp: 'https://www.notofilia.com/mcp',
      serverCard: 'https://www.notofilia.com/.well-known/mcp/server-card.json',
    },
  });
}

export async function onRequestPost(context) {
  const origin = new URL(context.request.url).origin;
  let body;
  try {
    body = await context.request.json();
  } catch {
    return json(rpcError(null, -32700, 'Parse error'), { status: 400 });
  }

  if (Array.isArray(body)) {
    const results = [];
    for (const msg of body) {
      const res = await handleMessage(msg, origin);
      if (res) results.push(res);
    }
    return json(results);
  }

  const result = await handleMessage(body, origin);
  if (result == null) return new Response(null, { status: 202 });
  return json(result);
}
