/**
 * WebMCP tools for Notofilia — expose catalog search and navigation to browser agents.
 * Uses navigator.modelContext.registerTool when available; provides a discovery shim otherwise.
 */
(() => {
  const TOOLS = [
    {
      name: 'notofilia_search_catalog',
      description:
        'Search Notofilia historical banknote and coin catalog pages by free-text query.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Text to match against titles, paths, and keywords',
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 50,
            default: 10,
          },
        },
        required: ['query'],
      },
      async execute(input) {
        const query = String(input?.query || '').trim();
        const limit = Number(input?.limit || 10) || 10;
        const url = new URL('/api/catalog', location.origin);
        url.searchParams.set('q', query);
        url.searchParams.set('limit', String(limit));
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Catalog search failed (${res.status})`);
        return await res.json();
      },
    },
    {
      name: 'notofilia_open_path',
      description: 'Navigate the browser to a site-relative Notofilia path (e.g. /coleccion/).',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Site-relative path beginning with /',
          },
        },
        required: ['path'],
      },
      async execute(input) {
        const path = String(input?.path || '/');
        if (!path.startsWith('/')) throw new Error('path must be site-relative');
        location.assign(path);
        return { navigated: path };
      },
    },
    {
      name: 'notofilia_site_info',
      description: 'Return Notofilia site identity and agent discovery document URLs.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      async execute() {
        return {
          name: 'Notofilia',
          url: location.origin + '/',
          discovery: {
            apiCatalog: '/.well-known/api-catalog',
            mcpServerCard: '/.well-known/mcp/server-card.json',
            authMd: '/auth.md',
            openapi: '/openapi.json',
            oauthProtectedResource: '/.well-known/oauth-protected-resource',
            oauthAuthorizationServer: '/.well-known/oauth-authorization-server',
            agentIndex: '/.well-known/agent-index.json',
            agentSkills: '/.well-known/agent-skills/index.json',
          },
        };
      },
    },
  ];

  function ensureModelContext() {
    const existing = navigator.modelContext;
    if (existing && (typeof existing.registerTool === 'function' || typeof existing.provideContext === 'function')) {
      return existing;
    }

    const toolMap = new Map();
    const shim = {
      async registerTool(tool) {
        if (!tool?.name) throw new Error('tool.name required');
        toolMap.set(tool.name, tool);
      },
      async provideContext(context) {
        const list = context?.tools || [];
        for (const tool of list) {
          if (tool?.name) toolMap.set(tool.name, tool);
        }
      },
      get tools() {
        return Array.from(toolMap.values());
      },
      listTools() {
        return Array.from(toolMap.values());
      },
    };

    try {
      Object.defineProperty(navigator, 'modelContext', {
        value: shim,
        configurable: true,
        enumerable: true,
        writable: true,
      });
    } catch {
      navigator.modelContext = shim;
    }
    return navigator.modelContext;
  }

  async function registerAll() {
    const mc = ensureModelContext();
    if (typeof mc.provideContext === 'function' && typeof mc.registerTool !== 'function') {
      await mc.provideContext({ tools: TOOLS });
      return;
    }
    if (typeof mc.provideContext === 'function') {
      try {
        await mc.provideContext({ tools: TOOLS });
      } catch {
        // Fall through to imperative registration.
      }
    }
    if (typeof mc.registerTool === 'function') {
      for (const tool of TOOLS) {
        try {
          await mc.registerTool(tool);
        } catch (error) {
          console.warn('[webmcp] registerTool failed for', tool.name, error);
        }
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      registerAll().catch((error) => console.warn('[webmcp]', error));
    });
  } else {
    registerAll().catch((error) => console.warn('[webmcp]', error));
  }
})();
