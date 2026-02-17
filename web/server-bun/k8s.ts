/* eslint-disable @typescript-eslint/no-explicit-any */
import { KubeConfig, CustomObjectsApi } from '@kubernetes/client-node';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

// Check if kubeconfig exists
function hasKubeconfig(): boolean {
  try {
    const kubeconfigPath = process.env.KUBECONFIG || join(homedir(), '.kube', 'config');
    return existsSync(kubeconfigPath);
  } catch (error) {
    console.error('Error checking kubeconfig:', error);
    return false;
  }
}

// Check if we're in local development mode (no cluster access)
function isLocalDevelopment(): boolean {
  // If running in a Kubernetes pod, not local dev
  if (process.env.KUBERNETES_SERVICE_HOST) {
    return false;
  }
  
  // Check if kubeconfig exists
  if (hasKubeconfig()) {
    return false;
  }
  
  // No cluster access detected
  return true;
}

// Environment configuration
export let serverConfig = {
  namespace: 'default',
  staticDir: './dist',
  devUser: '',
  devAccessToken: '',
  port: 8090,
};

// Initialize config from environment variables
export function initializeConfig() {
  // Only allow DEV_ACCESS_TOKEN in development mode
  const devAccessToken = process.env.NODE_ENV === 'development' 
    ? (process.env.DEV_ACCESS_TOKEN || '')
    : '';

  serverConfig = {
    namespace: process.env.NAMESPACE || 'default',
    staticDir: process.env.STATIC_DIR || './dist',
    devUser: process.env.DEV_USER || '',
    devAccessToken,
    port: parseInt(process.env.PORT || '8090'),
  };

  // Warn if DEV_ACCESS_TOKEN is set in production
  if (process.env.NODE_ENV === 'production' && process.env.DEV_ACCESS_TOKEN) {
    console.warn('⚠️  WARNING: DEV_ACCESS_TOKEN is set but will be ignored in production mode');
  }
}

// Create a mock Kubernetes client for local development
function createMockK8sClient(): any {
  const mockClient = {
    listNamespacedCustomObject: async () => ({ body: { items: [] } }),
    getNamespacedCustomObject: async () => { 
      throw { statusCode: 404 }; 
    },
    createNamespacedCustomObject: async () => { 
      throw { statusCode: 500, message: 'Mock client - not implemented' }; 
    },
    replaceNamespacedCustomObject: async () => { 
      throw { statusCode: 500, message: 'Mock client - not implemented' }; 
    },
    deleteNamespacedCustomObject: async () => { 
      throw { statusCode: 500, message: 'Mock client - not implemented' }; 
    },
  };
  
  return mockClient;
}

// Create Kubernetes client with user's JWT token OR service account
export async function createUserK8sClient(jwt: string | null): Promise<CustomObjectsApi> {
  if (isLocalDevelopment()) {
    console.log('Using mock Kubernetes client for local development');
    return createMockK8sClient();
  }

  const kc = new KubeConfig();
  
  try {
    // If not running in-cluster, load kubeconfig
    if (!process.env.KUBERNETES_SERVICE_HOST) {
      kc.loadFromDefault();
      
      // If JWT token provided, use it (user impersonation mode)
      if (jwt) {
        const cluster = kc.getCurrentCluster();
        
        if (!cluster) {
          throw new Error('No cluster found in kubeconfig');
        }

        console.log(`Using JWT token with cluster: ${cluster.server}`);
        
        // Create a new user with the JWT token
        // IMPORTANT: Keep the cluster's CA certificate from kubeconfig
        const user = {
          name: 'jwt-user',
          token: jwt,
        };

        const context = {
          name: 'jwt-context',
          user: user.name,
          cluster: cluster.name,
        };

        kc.loadFromOptions({
          clusters: [cluster], // This includes the CA certificate
          users: [user],
          contexts: [context],
          currentContext: context.name,
        });

        return kc.makeApiClient(CustomObjectsApi);
      }
      
      // No JWT - use kubectl credentials (service account simulation)
      console.log('Using kubectl credentials (service account mode)');
      return kc.makeApiClient(CustomObjectsApi);
    }
    
    // Running in-cluster - create in-cluster config with user's JWT token
    const cluster = {
      name: 'default-cluster',
      server: `https://${process.env.KUBERNETES_SERVICE_HOST}:${process.env.KUBERNETES_SERVICE_PORT}`,
      skipTLSVerify: false,
      // In-cluster CA certificate is mounted at this path
      caFile: '/var/run/secrets/kubernetes.io/serviceaccount/ca.crt',
    };

    const user = {
      name: 'user',
      token: jwt || '',
    };

    const context = {
      name: 'default-context',
      user: user.name,
      cluster: cluster.name,
    };

    kc.loadFromOptions({
      clusters: [cluster],
      users: [user],
      contexts: [context],
      currentContext: context.name,
    });

    return kc.makeApiClient(CustomObjectsApi);
  } catch (error) {
    console.error('Failed to create user K8s client:', error);
    throw new Error('Unable to create Kubernetes client');
  }
}

// Lazy-loaded Kubernetes clients to prevent circular dependencies
let serviceAccountClient: CustomObjectsApi | null = null;
let serviceAccountClientError: Error | null = null;

// Create Kubernetes client with service account (for templates)
export async function createServiceAccountK8sClient(): Promise<CustomObjectsApi> {
  if (isLocalDevelopment()) {
    console.log('Using mock Kubernetes client for local development');
    return createMockK8sClient();
  }

  // Return cached client if available
  if (serviceAccountClient) {
    return serviceAccountClient;
  }
  
  // If we previously failed, throw the same error
  if (serviceAccountClientError) {
    throw serviceAccountClientError;
  }

  const kc = new KubeConfig();
  
  try {
    // Try in-cluster config first
    kc.loadFromCluster();
    serviceAccountClient = kc.makeApiClient(CustomObjectsApi);
    return serviceAccountClient;
  } catch (clusterError) {
    try {
      // Fallback to default kubeconfig for local development
      console.log('Falling back to default kubeconfig', clusterError);
      kc.loadFromDefault();
      serviceAccountClient = kc.makeApiClient(CustomObjectsApi);
      return serviceAccountClient;
    } catch (defaultError) {
      console.error('Failed to load kubeconfig:', defaultError);
      // Cache the error to prevent repeated attempts
      serviceAccountClientError = new Error('Unable to load Kubernetes configuration - this is expected in local development without kubectl configured');
      throw serviceAccountClientError;
    }
  }
}

// Convert Kubernetes resource to API response format
export function workspaceToResponse(ws: any): any {
  return {
    metadata: {
      name: ws.metadata?.name || '',
      namespace: ws.metadata?.namespace || '',
      annotations: ws.metadata?.annotations || {},
      creationTimestamp: ws.metadata?.creationTimestamp || '',
    },
    spec: {
      displayName: ws.spec?.displayName || '',
      image: ws.spec?.image || '',
      desiredStatus: ws.spec?.desiredStatus || '',
      accessType: ws.spec?.accessType || '',
      ownershipType: ws.spec?.ownershipType || '',
      resources: extractResourceSpec(ws.spec?.resources),
    },
    status: ws.status ? {
      accessURL: ws.status.accessURL || '',
      conditions: ws.status.conditions?.map((c: any) => ({
        type: c.type || '',
        status: c.status || '',
        reason: c.reason || '',
        message: c.message || '',
      })) || [],
    } : undefined,
  };
}

function extractResourceSpec(resources: any): any {
  if (!resources) {
    return { limits: { cpu: '', memory: '' }, requests: { cpu: '', memory: '' } };
  }

  return {
    limits: {
      cpu: resources.limits?.cpu || '',
      memory: resources.limits?.memory || '',
    },
    requests: {
      cpu: resources.requests?.cpu || '',
      memory: resources.requests?.memory || '',
    },
  };
}

export function templateToResponse(tmpl: any): any {
  const resp: any = {
    name: tmpl.metadata?.name || '',
    namespace: tmpl.metadata?.namespace || '',
    displayName: tmpl.spec?.displayName || '',
    description: tmpl.spec?.description || '',
    defaultImage: tmpl.spec?.defaultImage || '',
    allowedImages: tmpl.spec?.allowedImages || [],
    allowCustomImages: tmpl.spec?.allowCustomImages || false,
    defaultAccessType: tmpl.spec?.defaultAccessType || '',
    defaultOwnershipType: tmpl.spec?.defaultOwnershipType || '',
  };

  // Resource bounds
  if (tmpl.spec?.resourceBounds?.resources) {
    resp.resourceBounds = {};
    const resources = tmpl.spec.resourceBounds.resources;
    
    if (resources.cpu) {
      resp.resourceBounds.cpu = {
        min: resources.cpu.min || '',
        max: resources.cpu.max || '',
      };
    }
    if (resources.memory) {
      resp.resourceBounds.memory = {
        min: resources.memory.min || '',
        max: resources.memory.max || '',
      };
    }
    if (resources['nvidia.com/gpu']) {
      resp.resourceBounds.gpu = {
        min: resources['nvidia.com/gpu'].min || '',
        max: resources['nvidia.com/gpu'].max || '',
      };
    }
  }

  // Default resources
  if (tmpl.spec?.defaultResources) {
    resp.defaultResources = {
      cpu: tmpl.spec.defaultResources.requests?.cpu || '',
      memory: tmpl.spec.defaultResources.requests?.memory || '',
    };
  }

  // Storage config
  if (tmpl.spec?.primaryStorage) {
    resp.storageConfig = {
      defaultSize: tmpl.spec.primaryStorage.defaultSize || '',
      minSize: tmpl.spec.primaryStorage.minSize || '',
      maxSize: tmpl.spec.primaryStorage.maxSize || '',
      mountPath: tmpl.spec.primaryStorage.defaultMountPath || '',
    };
  }

  // Idle shutdown
  if (tmpl.spec?.defaultIdleShutdown) {
    resp.idleShutdown = {
      enabled: tmpl.spec.defaultIdleShutdown.enabled || false,
      defaultTimeoutMinutes: tmpl.spec.defaultIdleShutdown.idleTimeoutInMinutes || 0,
    };
    
    if (tmpl.spec.idleShutdownOverrides) {
      resp.idleShutdown.minTimeoutMinutes = tmpl.spec.idleShutdownOverrides.minIdleTimeoutInMinutes;
      resp.idleShutdown.maxTimeoutMinutes = tmpl.spec.idleShutdownOverrides.maxIdleTimeoutInMinutes;
    }
  }

  return resp;
}
