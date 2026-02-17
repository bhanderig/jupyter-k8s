import { serve } from 'bun';
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { KubeConfig, Watch } from '@kubernetes/client-node';
import { createUserK8sClient, workspaceToResponse, templateToResponse, initializeConfig, serverConfig } from './k8s';

// Initialize configuration from environment
initializeConfig();

// Logger utility
function log(level: 'info' | 'warn' | 'error' | 'debug', message: string, ...args: unknown[]) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  if (args.length > 0) {
    console.log(logMessage, ...args);
  } else {
    console.log(logMessage);
  }
}

// Extract JWT token from request
function extractJWT(req: Request): string | null {
  // Log all headers for debugging
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });
  log('debug', 'Request headers:', headers);

  // In development, use DEV_ACCESS_TOKEN from environment if available
  if (process.env.NODE_ENV === 'development' && serverConfig.devAccessToken) {
    return serverConfig.devAccessToken;
  }

  // Try X-Auth-Request-Access-Token header (from OAuth2 Proxy) - PREFERRED for K8s API
  // This is the access token that Kubernetes API server will accept
  const accessTokenHeader = req.headers.get('X-Auth-Request-Access-Token');
  if (accessTokenHeader) {
    log('debug', 'Using access token from X-Auth-Request-Access-Token header');
    return accessTokenHeader;
  }

  log('warn', 'No JWT token found in request');
  return null;
}

// Response helpers
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function errorResponse(status: number, message: string, details?: string): Response {
  return jsonResponse({ error: message, details }, status);
}

// API Handlers
async function handleListWorkspaces(req: Request): Promise<Response> {
  const jwt = extractJWT(req);
  const startTime = Date.now();

  try {
    const k8sClient = await createUserK8sClient(jwt);
    const response = await k8sClient.listNamespacedCustomObject(
      'workspace.jupyter.org',
      'v1alpha1',
      serverConfig.namespace,
      'workspaces'
    );

    const responseBody = response.body as { items: unknown[] };
    const workspaces = responseBody.items.map(workspaceToResponse);
    log('info', `Listed ${workspaces.length} workspaces`);
    log('debug', `Request completed in ${Date.now() - startTime}ms`);
    return jsonResponse(workspaces);
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    log('error', 'Error listing workspaces:', error);
    if (err.statusCode === 403) {
      return errorResponse(403, 'Forbidden - insufficient permissions');
    }
    return errorResponse(500, 'Failed to list workspaces', err.message);
  }
}

async function handleGetWorkspace(workspaceName: string, req: Request): Promise<Response> {
  const jwt = extractJWT(req);

  try {
    const k8sClient = await createUserK8sClient(jwt);
    const response = await k8sClient.getNamespacedCustomObject(
      'workspace.jupyter.org',
      'v1alpha1',
      serverConfig.namespace,
      'workspaces',
      workspaceName
    );

    const workspace = workspaceToResponse(response.body);
    log('info', `Retrieved workspace: ${workspaceName}`);
    return jsonResponse(workspace);
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    log('error', `Error getting workspace ${workspaceName}:`, error);
    if (err.statusCode === 404) {
      return errorResponse(404, 'Workspace not found');
    }
    if (err.statusCode === 403) {
      return errorResponse(403, 'Forbidden - insufficient permissions');
    }
    return errorResponse(500, 'Failed to get workspace', err.message);
  }
}

async function handleCreateWorkspace(req: Request): Promise<Response> {
  const jwt = extractJWT(req);

  try {
    const body = await req.json() as {
      name: string;
      displayName?: string;
      image?: string;
      desiredStatus?: string;
      accessType?: string;
      ownershipType?: string;
      resources?: Record<string, unknown>;
      storage?: Record<string, unknown>;
      templateRef?: { name: string; namespace?: string };
      idleShutdown?: { enabled: boolean; timeoutInMinutes?: number };
      podSecurityContext?: Record<string, unknown>;
      accessStrategy?: { name: string; namespace?: string };
    };
    
    const k8sClient = await createUserK8sClient(jwt);

    // Create workspace spec
    const spec: Record<string, unknown> = {
      displayName: body.displayName || body.name,
      desiredStatus: body.desiredStatus || 'Running',
      accessType: body.accessType || 'Public',
      ownershipType: body.ownershipType || 'OwnerOnly',
    };

    // Add optional fields only if provided
    // IMPORTANT: Include image field to override template defaults
    if (body.image) {
      spec.image = body.image;
    }
    if (body.resources) {
      spec.resources = body.resources;
    }
    if (body.storage) {
      spec.storage = body.storage;
    }
    if (body.templateRef) {
      spec.templateRef = body.templateRef;
    }
    if (body.idleShutdown) {
      // Map frontend field name to Kubernetes API field name
      spec.idleShutdown = {
        enabled: body.idleShutdown.enabled,
        idleTimeoutInMinutes: body.idleShutdown.timeoutInMinutes,
      };
    }
    if (body.podSecurityContext) {
      spec.podSecurityContext = body.podSecurityContext;
    }
    if (body.accessStrategy) {
      spec.accessStrategy = body.accessStrategy;
    }
    if (body.accessStrategy) {
      spec.accessStrategy = body.accessStrategy;
    }

    // Create workspace object
    const workspace = {
      apiVersion: 'workspace.jupyter.org/v1alpha1',
      kind: 'Workspace',
      metadata: {
        name: body.name,
        namespace: serverConfig.namespace,
      },
      spec,
    };

    const response = await k8sClient.createNamespacedCustomObject(
      'workspace.jupyter.org',
      'v1alpha1',
      serverConfig.namespace,
      'workspaces',
      workspace
    );

    const created = workspaceToResponse(response.body);
    log('info', `Created workspace: ${body.name}`);
    return jsonResponse(created, 201);
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    log('error', 'Error creating workspace:', error);
    if (err.statusCode === 409) {
      return errorResponse(409, 'Workspace already exists');
    }
    if (err.statusCode === 403) {
      return errorResponse(403, 'Forbidden - insufficient permissions');
    }
    return errorResponse(500, 'Failed to create workspace', err.message);
  }
}

async function handleUpdateWorkspace(workspaceName: string, req: Request): Promise<Response> {
  const jwt = extractJWT(req);

  try {
    const body = await req.json() as {
      displayName?: string;
      image?: string;
      desiredStatus?: string;
      resources?: Record<string, unknown>;
    };
    const k8sClient = await createUserK8sClient(jwt);

    // Get existing workspace
    const existing = await k8sClient.getNamespacedCustomObject(
      'workspace.jupyter.org',
      'v1alpha1',
      serverConfig.namespace,
      'workspaces',
      workspaceName
    );

    // Update spec fields
    const updated = { ...existing.body } as { spec: Record<string, unknown> };
    if (body.displayName) updated.spec.displayName = body.displayName;
    if (body.image) updated.spec.image = body.image;
    if (body.desiredStatus) updated.spec.desiredStatus = body.desiredStatus;
    if (body.resources) updated.spec.resources = body.resources;

    const response = await k8sClient.replaceNamespacedCustomObject(
      'workspace.jupyter.org',
      'v1alpha1',
      serverConfig.namespace,
      'workspaces',
      workspaceName,
      updated
    );

    const workspace = workspaceToResponse(response.body);
    log('info', `Updated workspace: ${workspaceName}`);
    return jsonResponse(workspace);
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    log('error', `Error updating workspace ${workspaceName}:`, error);
    if (err.statusCode === 404) {
      return errorResponse(404, 'Workspace not found');
    }
    if (err.statusCode === 403) {
      return errorResponse(403, 'Forbidden - insufficient permissions');
    }
    return errorResponse(500, 'Failed to update workspace', err.message);
  }
}

async function handleDeleteWorkspace(workspaceName: string, req: Request): Promise<Response> {
  const jwt = extractJWT(req);

  try {
    const k8sClient = await createUserK8sClient(jwt);
    await k8sClient.deleteNamespacedCustomObject(
      'workspace.jupyter.org',
      'v1alpha1',
      serverConfig.namespace,
      'workspaces',
      workspaceName
    );

    log('info', `Deleted workspace: ${workspaceName}`);
    return jsonResponse({ message: 'Workspace deleted successfully' });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    log('error', `Error deleting workspace ${workspaceName}:`, error);
    if (err.statusCode === 404) {
      return errorResponse(404, 'Workspace not found');
    }
    if (err.statusCode === 403) {
      return errorResponse(403, 'Forbidden - insufficient permissions');
    }
    return errorResponse(500, 'Failed to delete workspace', err.message);
  }
}

async function handleListTemplates(req: Request): Promise<Response> {
  try {
    // Use user's token for listing templates (not service account)
    const jwt = extractJWT(req);
    if (!jwt) {
      return errorResponse(401, 'Authentication required');
    }

    const k8sClient = await createUserK8sClient(jwt);
    const response = await k8sClient.listNamespacedCustomObject(
      'workspace.jupyter.org',
      'v1alpha1',
      serverConfig.namespace,
      'workspacetemplates'
    );

    const responseBody = response.body as { items: unknown[] };
    const templates = responseBody.items.map(templateToResponse);
    log('info', `Listed ${templates.length} templates`);
    return jsonResponse(templates);
  } catch (error: unknown) {
    const err = error as { message?: string };
    log('error', 'Error listing templates:', error);
    return errorResponse(500, 'Failed to list templates', err.message);
  }
}

async function handleGetMe(req: Request): Promise<Response> {
  const jwt = extractJWT(req);

  if (!jwt) {
    return jsonResponse({
      authenticated: false,
      user: null,
    });
  }

  try {
    // Decode JWT to get user info
    const parts = jwt.split('.');
    if (parts.length !== 3) {
      return errorResponse(401, 'Invalid token format');
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString()) as Record<string, unknown>;

    return jsonResponse({
      authenticated: true,
      user: {
        username: payload.preferred_username || payload.sub,
        email: payload.email || null,
        groups: payload.groups || [],
      },
      claims: payload,
    });
  } catch (error: unknown) {
    log('error', 'Error decoding JWT:', error);
    return errorResponse(401, 'Invalid token');
  }
}

// Static file serving
function serveStatic(pathname: string): Response | null {
  const staticDir = resolve(serverConfig.staticDir);
  
  // Remove leading slash and resolve path
  const filePath = pathname === '/' ? 'index.html' : pathname.slice(1);
  const fullPath = resolve(join(staticDir, filePath));

  // Security: prevent directory traversal
  if (!fullPath.startsWith(staticDir)) {
    log('warn', `Path traversal attempt blocked: ${fullPath} not in ${staticDir}`);
    return errorResponse(403, 'Forbidden');
  }

  if (existsSync(fullPath)) {
    try {
      const content = readFileSync(fullPath);
      const ext = filePath.split('.').pop() || '';
      const contentType = {
        'html': 'text/html',
        'css': 'text/css',
        'js': 'application/javascript',
        'json': 'application/json',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'svg': 'image/svg+xml',
      }[ext] || 'application/octet-stream';

      return new Response(content, {
        headers: { 'Content-Type': contentType },
      });
    } catch (error) {
      log('error', `Error reading file ${fullPath}:`, error);
      return errorResponse(500, 'Internal server error');
    }
  }

  return null;
}

// SSE Handler - Server-Sent Events for real-time workspace updates using K8s Watch API
async function handleSSE(req: Request): Promise<Response> {
  const jwt = extractJWT(req);
  
  log('info', 'SSE connection established');

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let aborted = false;
      let watchAbortController: AbortController | null = null;
      
      // Send initial connection message
      controller.enqueue(encoder.encode(': connected\n\n'));

      // Function to send workspace updates
      const sendWorkspaces = async (workspaces: unknown[]) => {
        if (aborted) return;
        
        try {
          const data = JSON.stringify({ 
            type: 'workspaces', 
            data: workspaces.map(workspaceToResponse) 
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          log('debug', `Sent ${workspaces.length} workspaces via SSE`);
        } catch (error) {
          log('error', 'Error sending workspaces via SSE:', error);
        }
      };

      // Function to start watching Kubernetes resources
      const startWatch = async () => {
        if (aborted) return;

        try {
          const k8sClient = await createUserK8sClient(jwt);
          
          // Send initial workspace list
          const initialResponse = await k8sClient.listNamespacedCustomObject(
            'workspace.jupyter.org',
            'v1alpha1',
            serverConfig.namespace,
            'workspaces'
          );
          const initialBody = initialResponse.body as { items: unknown[] };
          await sendWorkspaces(initialBody.items);

          // Start watching for changes
          watchAbortController = new AbortController();
          
          // Use the Watch API from @kubernetes/client-node
          const kc = new KubeConfig();
          if (process.env.KUBERNETES_SERVICE_HOST) {
            // In-cluster config
            const cluster = {
              name: 'default-cluster',
              server: `https://${process.env.KUBERNETES_SERVICE_HOST}:${process.env.KUBERNETES_SERVICE_PORT}`,
              skipTLSVerify: false,
              caFile: '/var/run/secrets/kubernetes.io/serviceaccount/ca.crt',
            };
            const user = { name: 'user', token: jwt || '' };
            const context = { name: 'default-context', user: user.name, cluster: cluster.name };
            kc.loadFromOptions({
              clusters: [cluster],
              users: [user],
              contexts: [context],
              currentContext: context.name,
            });
          } else {
            // Local kubeconfig
            kc.loadFromDefault();
            if (jwt) {
              const cluster = kc.getCurrentCluster();
              if (cluster) {
                const user = { name: 'jwt-user', token: jwt };
                const context = { name: 'jwt-context', user: user.name, cluster: cluster.name };
                kc.loadFromOptions({
                  clusters: [cluster],
                  users: [user],
                  contexts: [context],
                  currentContext: context.name,
                });
              }
            }
          }

          const watch = new Watch(kc);
          const path = `/apis/workspace.jupyter.org/v1alpha1/namespaces/${serverConfig.namespace}/workspaces`;
          
          log('info', `Starting K8s watch on ${path}`);

          await watch.watch(
            path,
            {},
            async (type: string) => {
              if (aborted) return;
              
              log('debug', `K8s watch event: ${type}`);
              
              // On any change, fetch the full list and send it
              try {
                const response = await k8sClient.listNamespacedCustomObject(
                  'workspace.jupyter.org',
                  'v1alpha1',
                  serverConfig.namespace,
                  'workspaces'
                );
                const responseBody = response.body as { items: unknown[] };
                await sendWorkspaces(responseBody.items);
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
              
              // Reconnect after a delay
              if (!aborted) {
                log('info', 'Reconnecting K8s watch in 5 seconds...');
                setTimeout(() => startWatch(), 5000);
              }
            }
          );
        } catch (error) {
          log('error', 'Error starting K8s watch:', error);
          
          // Fallback to polling if watch fails
          if (!aborted) {
            log('warn', 'Falling back to polling mode');
            const pollInterval = setInterval(async () => {
              if (aborted) {
                clearInterval(pollInterval);
                return;
              }
              
              try {
                const k8sClient = await createUserK8sClient(jwt);
                const response = await k8sClient.listNamespacedCustomObject(
                  'workspace.jupyter.org',
                  'v1alpha1',
                  serverConfig.namespace,
                  'workspaces'
                );
                const responseBody = response.body as { items: unknown[] };
                await sendWorkspaces(responseBody.items);
              } catch (error) {
                log('error', 'Error fetching workspaces in polling mode:', error);
              }
            }, 5000);
          }
        }
      };

      // Start the watch
      startWatch();

      // Cleanup on connection close
      req.signal.addEventListener('abort', () => {
        log('info', 'SSE connection closed');
        aborted = true;
        if (watchAbortController) {
          watchAbortController.abort();
        }
        controller.close();
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

// Main request handler
async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const { pathname } = url;
  const method = req.method;

  log('debug', `${method} ${pathname}`);

  // API routes
  if (pathname.startsWith('/api/v1/')) {
    // Health check
    if (pathname === '/api/v1/health') {
      return jsonResponse({ status: 'ok' });
    }

    // User info
    if (pathname === '/api/v1/me') {
      return handleGetMe(req);
    }

    // SSE events endpoint
    if (pathname === '/api/v1/events') {
      if (method === 'GET') return handleSSE(req);
      return errorResponse(405, 'Method not allowed');
    }

    // Workspaces endpoints
    if (pathname === '/api/v1/workspaces') {
      if (method === 'GET') return handleListWorkspaces(req);
      if (method === 'POST') return handleCreateWorkspace(req);
      return errorResponse(405, 'Method not allowed');
    }

    // Individual workspace endpoints
    if (pathname.startsWith('/api/v1/workspaces/')) {
      const pathParts = pathname.split('/');
      const workspaceName = pathParts[4];

      if (!workspaceName) {
        return errorResponse(400, 'Workspace name required');
      }

      if (method === 'GET') return handleGetWorkspace(workspaceName, req);
      if (method === 'PUT' || method === 'PATCH') return handleUpdateWorkspace(workspaceName, req);
      if (method === 'DELETE') return handleDeleteWorkspace(workspaceName, req);
      return errorResponse(405, 'Method not allowed');
    }

    // Templates endpoint
    if (pathname === '/api/v1/templates') {
      if (method === 'GET') return handleListTemplates(req);
      return errorResponse(405, 'Method not allowed');
    }

    return errorResponse(404, 'API endpoint not found');
  }

  // Serve static files
  const staticResponse = serveStatic(pathname);
  if (staticResponse) {
    return staticResponse;
  }

  // SPA fallback - serve index.html for all other routes
  if (pathname !== '/' && !pathname.includes('.')) {
    const indexResponse = serveStatic('/');
    if (indexResponse) {
      return indexResponse;
    }
  }

  return errorResponse(404, 'Not found');
}

// Start server
console.log('🚀 Starting Jupyter K8s UI Backend Server (Bun)...');
console.log('📋 Environment Configuration:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'production'}`);
console.log(`   PORT: ${serverConfig.port}`);
console.log(`   NAMESPACE: ${serverConfig.namespace}`);
console.log(`   STATIC_DIR: ${serverConfig.staticDir}`);
console.log(`   DEV_USER: ${serverConfig.devUser || 'not set'}`);
console.log(`   DEV_ACCESS_TOKEN: ${serverConfig.devAccessToken ? '***set***' : 'not set'}`);

const server = serve({
  port: serverConfig.port,
  fetch: handleRequest,
  // SSE connections need to stay open indefinitely
  idleTimeout: 0, // Disable timeout for SSE
});

log('info', `🚀 Jupyter K8s UI Backend Server running at http://localhost:${server.port}`);
log('info', `📁 Serving static files from: ${serverConfig.staticDir}`);
log('info', `🔧 Kubernetes namespace: ${serverConfig.namespace}`);
log('info', `🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
