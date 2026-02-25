import { serve } from 'bun';
import { Watch } from '@kubernetes/client-node';
import {
  createUserK8sClient,
  createKubeConfig,
  workspaceToResponse,
  templateToResponse,
  initializeConfig,
  serverConfig,
} from './k8s';
import type {
  K8sWorkspace,
  K8sListResponse,
  K8sWorkspaceTemplate,
  CreateWorkspaceBody,
  UpdateWorkspaceBody,
} from './types';
import { log } from './logger';
import { extractJWT, decodeJWTPayload } from './auth';
import { jsonResponse, errorResponse, handleK8sError, isValidK8sName } from './responses';
import { serveStatic } from './static';

// --- Initialize ---

initializeConfig();

// --- API Handlers ---

async function handleListWorkspaces(req: Request): Promise<Response> {
  const jwt = extractJWT(req);
  const startTime = Date.now();

  try {
    const k8sClient = await createUserK8sClient(jwt);
    const response = await k8sClient.listNamespacedCustomObject(
      'workspace.jupyter.org', 'v1alpha1', serverConfig.namespace, 'workspaces'
    );

    const body = response.body as K8sListResponse<K8sWorkspace>;
    const workspaces = body.items.map(workspaceToResponse);
    log('info', `Listed ${workspaces.length} workspaces in ${Date.now() - startTime}ms`);
    return jsonResponse(workspaces);
  } catch (error) {
    return handleK8sError(error, 'Failed to list workspaces');
  }
}

async function handleGetWorkspace(workspaceName: string, req: Request): Promise<Response> {
  const jwt = extractJWT(req);

  try {
    const k8sClient = await createUserK8sClient(jwt);
    const response = await k8sClient.getNamespacedCustomObject(
      'workspace.jupyter.org', 'v1alpha1', serverConfig.namespace, 'workspaces', workspaceName
    );

    const workspace = workspaceToResponse(response.body as K8sWorkspace);
    log('info', `Retrieved workspace: ${workspaceName}`);
    return jsonResponse(workspace);
  } catch (error) {
    return handleK8sError(error, `Failed to get workspace ${workspaceName}`);
  }
}

async function handleCreateWorkspace(req: Request): Promise<Response> {
  const jwt = extractJWT(req);

  try {
    const body = (await req.json()) as CreateWorkspaceBody;

    if (!isValidK8sName(body.name)) {
      return errorResponse(400, 'Invalid workspace name — must be a valid Kubernetes resource name (lowercase alphanumeric and hyphens, 1-253 chars)');
    }

    const k8sClient = await createUserK8sClient(jwt);

    const spec: Record<string, unknown> = {
      displayName: body.displayName || body.name,
      desiredStatus: body.desiredStatus || 'Running',
      accessType: body.accessType || 'Public',
      ownershipType: body.ownershipType || 'OwnerOnly',
    };

    if (body.image) spec.image = body.image;
    if (body.resources) spec.resources = body.resources;
    if (body.storage) spec.storage = body.storage;
    if (body.templateRef) spec.templateRef = body.templateRef;
    if (body.podSecurityContext) spec.podSecurityContext = body.podSecurityContext;
    if (body.accessStrategy) spec.accessStrategy = body.accessStrategy;

    if (body.idleShutdown) {
      spec.idleShutdown = {
        enabled: body.idleShutdown.enabled,
        idleTimeoutInMinutes: body.idleShutdown.timeoutInMinutes,
      };
    }

    const workspace = {
      apiVersion: 'workspace.jupyter.org/v1alpha1',
      kind: 'Workspace',
      metadata: { name: body.name, namespace: serverConfig.namespace },
      spec,
    };

    const response = await k8sClient.createNamespacedCustomObject(
      'workspace.jupyter.org', 'v1alpha1', serverConfig.namespace, 'workspaces', workspace
    );

    const created = workspaceToResponse(response.body as K8sWorkspace);
    log('info', `Created workspace: ${body.name}`);
    return jsonResponse(created, 201);
  } catch (error) {
    return handleK8sError(error, 'Failed to create workspace');
  }
}

async function handleUpdateWorkspace(workspaceName: string, req: Request): Promise<Response> {
  const jwt = extractJWT(req);

  try {
    const body = (await req.json()) as UpdateWorkspaceBody;
    const k8sClient = await createUserK8sClient(jwt);

    const existing = await k8sClient.getNamespacedCustomObject(
      'workspace.jupyter.org', 'v1alpha1', serverConfig.namespace, 'workspaces', workspaceName
    );

    // Deep clone to avoid mutating the cached response
    const updated = JSON.parse(JSON.stringify(existing.body)) as K8sWorkspace;

    if (body.displayName) updated.spec.displayName = body.displayName;
    if (body.image) updated.spec.image = body.image;
    if (body.desiredStatus) updated.spec.desiredStatus = body.desiredStatus;
    if (body.resources) updated.spec.resources = body.resources;

    const response = await k8sClient.replaceNamespacedCustomObject(
      'workspace.jupyter.org', 'v1alpha1', serverConfig.namespace, 'workspaces', workspaceName, updated
    );

    const workspace = workspaceToResponse(response.body as K8sWorkspace);
    log('info', `Updated workspace: ${workspaceName}`);
    return jsonResponse(workspace);
  } catch (error) {
    return handleK8sError(error, `Failed to update workspace ${workspaceName}`);
  }
}

async function handleDeleteWorkspace(workspaceName: string, req: Request): Promise<Response> {
  const jwt = extractJWT(req);

  try {
    const k8sClient = await createUserK8sClient(jwt);
    await k8sClient.deleteNamespacedCustomObject(
      'workspace.jupyter.org', 'v1alpha1', serverConfig.namespace, 'workspaces', workspaceName
    );

    log('info', `Deleted workspace: ${workspaceName}`);
    return jsonResponse({ message: 'Workspace deleted successfully' });
  } catch (error) {
    return handleK8sError(error, `Failed to delete workspace ${workspaceName}`);
  }
}

async function handleListTemplates(req: Request): Promise<Response> {
  const jwt = extractJWT(req);
  if (!jwt) {
    return errorResponse(401, 'Authentication required');
  }

  try {
    const k8sClient = await createUserK8sClient(jwt);
    const response = await k8sClient.listNamespacedCustomObject(
      'workspace.jupyter.org', 'v1alpha1', serverConfig.namespace, 'workspacetemplates'
    );

    const body = response.body as K8sListResponse<K8sWorkspaceTemplate>;
    const templates = body.items.map(templateToResponse);
    log('info', `Listed ${templates.length} templates`);
    return jsonResponse(templates);
  } catch (error) {
    return handleK8sError(error, 'Failed to list templates');
  }
}

async function handleGetMe(req: Request): Promise<Response> {
  const jwt = extractJWT(req);

  if (!jwt) {
    return jsonResponse({ authenticated: false, user: null });
  }

  const payload = decodeJWTPayload(jwt);
  if (!payload) {
    return errorResponse(401, 'Invalid token');
  }

  return jsonResponse({
    authenticated: true,
    user: {
      username: payload.preferred_username || payload.sub,
      email: payload.email || null,
      groups: payload.groups || [],
    },
    claims: payload,
  });
}

// --- SSE Handler ---

async function handleSSE(req: Request): Promise<Response> {
  const jwt = extractJWT(req);
  log('info', 'SSE connection established');

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let aborted = false;
      let watchRequest: { abort: () => void } | null = null;
      let pollTimer: ReturnType<typeof setInterval> | null = null;

      const cleanup = () => {
        aborted = true;
        if (watchRequest) {
          try { watchRequest.abort(); } catch { /* ignore */ }
          watchRequest = null;
        }
        if (pollTimer) {
          clearInterval(pollTimer);
          pollTimer = null;
        }
      };

      controller.enqueue(encoder.encode(': connected\n\n'));

      const sendWorkspaces = (workspaces: K8sWorkspace[]) => {
        if (aborted) return;
        try {
          const data = JSON.stringify({
            type: 'workspaces',
            data: workspaces.map(workspaceToResponse),
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          log('debug', `Sent ${workspaces.length} workspaces via SSE`);
        } catch (error) {
          log('error', 'Error sending workspaces via SSE:', error);
        }
      };

      const startWatch = async () => {
        if (aborted) return;

        try {
          const k8sClient = await createUserK8sClient(jwt);

          const initialResponse = await k8sClient.listNamespacedCustomObject(
            'workspace.jupyter.org', 'v1alpha1', serverConfig.namespace, 'workspaces'
          );
          const initialBody = initialResponse.body as K8sListResponse<K8sWorkspace>;
          sendWorkspaces(initialBody.items);

          const kc = createKubeConfig(jwt);
          const watch = new Watch(kc);
          const path = `/apis/workspace.jupyter.org/v1alpha1/namespaces/${serverConfig.namespace}/workspaces`;

          log('info', `Starting K8s watch on ${path}`);

          const watchReq = await watch.watch(
            path,
            {},
            async (_type: string) => {
              if (aborted) return;
              log('debug', `K8s watch event: ${_type}`);

              try {
                const response = await k8sClient.listNamespacedCustomObject(
                  'workspace.jupyter.org', 'v1alpha1', serverConfig.namespace, 'workspaces'
                );
                const body = response.body as K8sListResponse<K8sWorkspace>;
                sendWorkspaces(body.items);
              } catch (error) {
                log('error', 'Error fetching workspaces after watch event:', error);
              }
            },
            (err: unknown) => {
              if (aborted) return;

              if (err) {
                log('error', 'K8s watch error:', err);
              } else {
                log('info', 'K8s watch ended normally');
              }

              if (!aborted) {
                log('info', 'Reconnecting K8s watch in 5 seconds...');
                setTimeout(() => startWatch(), 5000);
              }
            }
          );

          watchRequest = watchReq;
        } catch (error) {
          log('error', 'Error starting K8s watch:', error);

          if (!aborted) {
            log('warn', 'Falling back to polling mode');
            pollTimer = setInterval(async () => {
              if (aborted) return;

              try {
                const k8sClient = await createUserK8sClient(jwt);
                const response = await k8sClient.listNamespacedCustomObject(
                  'workspace.jupyter.org', 'v1alpha1', serverConfig.namespace, 'workspaces'
                );
                const body = response.body as K8sListResponse<K8sWorkspace>;
                sendWorkspaces(body.items);
              } catch (error) {
                log('error', 'Polling error:', error);
              }
            }, 5000);
          }
        }
      };

      startWatch();

      req.signal.addEventListener('abort', () => {
        log('info', 'SSE connection closed');
        cleanup();
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// --- Router ---

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const { pathname } = url;
  const method = req.method;

  log('debug', `${method} ${pathname}`);

  if (pathname.startsWith('/api/v1/')) {
    if (pathname === '/api/v1/health') {
      return jsonResponse({ status: 'ok' });
    }

    if (pathname === '/api/v1/me') {
      return handleGetMe(req);
    }

    if (pathname === '/api/v1/events') {
      if (method === 'GET') return handleSSE(req);
      return errorResponse(405, 'Method not allowed');
    }

    if (pathname === '/api/v1/workspaces') {
      if (method === 'GET') return handleListWorkspaces(req);
      if (method === 'POST') return handleCreateWorkspace(req);
      return errorResponse(405, 'Method not allowed');
    }

    if (pathname.startsWith('/api/v1/workspaces/')) {
      const workspaceName = pathname.split('/')[4];
      if (!workspaceName) {
        return errorResponse(400, 'Workspace name required');
      }

      if (method === 'GET') return handleGetWorkspace(workspaceName, req);
      if (method === 'PUT' || method === 'PATCH') return handleUpdateWorkspace(workspaceName, req);
      if (method === 'DELETE') return handleDeleteWorkspace(workspaceName, req);
      return errorResponse(405, 'Method not allowed');
    }

    if (pathname === '/api/v1/templates') {
      if (method === 'GET') return handleListTemplates(req);
      return errorResponse(405, 'Method not allowed');
    }

    return errorResponse(404, 'API endpoint not found');
  }

  // Static files
  const staticResponse = serveStatic(pathname);
  if (staticResponse) return staticResponse;

  // SPA fallback
  if (pathname !== '/' && !pathname.includes('.')) {
    const indexResponse = serveStatic('/');
    if (indexResponse) return indexResponse;
  }

  return errorResponse(404, 'Not found');
}

// --- Start Server ---

console.log('🚀 Starting Jupyter K8s UI Backend Server (Bun)...');
console.log('📋 Configuration:');
console.log(`   NODE_ENV:  ${process.env.NODE_ENV || 'production'}`);
console.log(`   PORT:      ${serverConfig.port}`);
console.log(`   NAMESPACE: ${serverConfig.namespace}`);
console.log(`   LOG_LEVEL: ${serverConfig.logLevel}`);
console.log(`   STATIC:    ${serverConfig.staticDir}`);
console.log(`   DEV_TOKEN: ${serverConfig.devAccessToken ? '***set***' : 'not set'}`);

const server = serve({
  port: serverConfig.port,
  fetch: handleRequest,
  idleTimeout: 0,
});

log('info', `Server running at http://localhost:${server.port}`);
