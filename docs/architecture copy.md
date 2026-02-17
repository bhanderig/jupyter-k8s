# Jupyter Workspaces UI Architecture

This document describes the web UI and backend components added to jupyter-k8s.

## Overview

The UI provides an optional self-service portal for users to create, manage, and access Jupyter workspaces running on Kubernetes. The system works with or without the UI components.

## Architecture with Optional UI

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Browser  │────│   Traefik       │────│   oauth2-proxy  │
│                 │    │   (Ingress)     │    │   (Auth)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                       ┌─────────────────────────────────────────┐
                       │            OPTIONAL UI LAYER            │
                       │                                         │
                       │  ┌─────────────────┐  ┌───────────────┐ │
                       │  │  React Frontend │  │  UI Backend   │ │
                       │  │  (Static Files) │  │  (Go Server)  │ │
                       │  │                 │  │               │ │
                       │  │ • Workspace UI  │  │ • REST API    │ │
                       │  │ • Template Cards│  │ • SSE Events  │ │
                       │  │ • Real-time     │  │ • SPA Handler │ │
                       │  │   Updates       │  │               │ │
                       │  └─────────────────┘  └───────────────┘ │
                       └─────────────────────────────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   kubectl/API   │────│  Extension API  │────│  K8s API Server │
│   (Direct)      │    │  (Permission    │    │  (CRDs)         │
│                 │    │   Checks)       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                       ┌─────────────────────────────────────────┐
                       │           CORE SYSTEM                   │
                       │                                         │
                       │  ┌─────────────────┐  ┌───────────────┐ │
                       │  │   Controller    │  │  Workspaces   │ │
                       │  │  (Reconciler)   │  │  (Pods/Svcs)  │ │
                       │  │                 │  │               │ │
                       │  │ • Workspace     │  │ • Jupyter     │ │
                       │  │   Lifecycle     │  │   Instances   │ │
                       │  │ • Resource      │  │ • Storage     │ │
                       │  │   Management    │  │ • Networking  │ │
                       │  └─────────────────┘  └───────────────┘ │
                       └─────────────────────────────────────────┘
```

## Access Patterns

### With UI (Self-Service Portal)
```
User → Browser → Traefik → oauth2-proxy → UI Backend → Extension API → K8s API
                                      ↓
                                 React Frontend
```

### Without UI (Direct API/kubectl)
```
User → kubectl/API → Extension API → K8s API
```

### Workspace Access (Both modes)
```
User → Browser → Traefik → oauth2-proxy → auth-middleware → Workspace Pod
```

## Integration with Existing OIDC Flow

The UI components integrate seamlessly with the existing authentication infrastructure shown in your diagram:

### Routing Decision Point

```
┌─────────────────┐
│   oauth2-proxy  │
│   (router ns)   │
└─────────────────┘
         │
         ▼
    Route Decision
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌─────────────┐
│UI Backend│ │Extension API│
│(optional)│ │ (always)    │
│         │ │             │
│/        │ │/api/ext     │
│/api/v1  │ │             │
└─────────┘ └─────────────┘
```

### When UI is Enabled
- **Path `/`**: Serves React SPA + REST API
- **Path `/api/v1/*`**: UI Backend handles workspace CRUD
- **Path `/api/ext/*`**: Extension API handles connections + auth

### When UI is Disabled  
- **Path `/`**: Routes directly to Extension API
- **All paths**: Extension API only (existing behavior)

### Credential Flow (UI Enabled)

```
┌─────────────┐   Headers:           ┌─────────────┐   Service Account:   ┌─────────────┐
│ oauth2-proxy│   X-Auth-Request-*   │ UI Backend  │   K8s API calls      │Extension API│
│             │ ────────────────────▶│             │ ────────────────────▶│             │
│ • User: john│                      │ • Reads     │                      │ • Permission│
│ • Groups: []│                      │   headers   │   User Info:         │   checks    │
│ • Email: .. │                      │ • Uses own  │   john + groups      │ • RBAC      │
└─────────────┘                      │   SA creds  │ ◄────────────────────│ • Ownership │
                                     └─────────────┘                      └─────────────┘
```

This maintains the existing security model while adding the optional UI layer.

## Helm Chart Integration Strategy

### Chart Structure
The UI components will be added to the existing `aws-traefik-dex` chart as optional components:

```yaml
# values.yaml
uibackend:
  enabled: false  # Default: disabled for backward compatibility
  replicas: 1
  image:
    repository: uibackend
    tag: latest
  namespace: default  # Where workspaces are created
  resources:
    limits:
      cpu: 500m
      memory: 512Mi
```

### Deployment Components (when enabled)
1. **UI Backend Deployment**: Go server with React static files
2. **UI Backend Service**: ClusterIP service on port 8090  
3. **UI Backend ServiceAccount**: With workspace CRUD permissions
4. **Ingress Route Update**: Routes `/` to UI Backend instead of Extension API

### RBAC Requirements
The UI Backend service account needs these cluster permissions:

```yaml
rules:
# Workspace CRUD operations
- apiGroups: ["workspace.jupyter.org"]
  resources: ["workspaces", "workspacetemplates"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
# Permission checks via Extension API
- apiGroups: ["connection.jupyter.org"] 
  resources: ["workspaceaccessreviews"]
  verbs: ["create"]
```

### Backward Compatibility
- **Default behavior unchanged**: UI disabled by default
- **Existing installations**: Continue working without modification
- **Migration path**: Set `uibackend.enabled: true` to add UI

---

---

## Backend Changes

### 1. UI Backend Server (`web/server/`)

**Why:** The existing Extension API serves internal cluster communication (workspace connections, pod exec authorization). A separate UI backend was needed to:

- Serve the React SPA and handle client-side routing
- Provide a REST API tailored for the frontend (simplified response shapes)
- Handle user authentication headers from the auth middleware
- Implement SSE for real-time workspace status updates

**Implementation:** Migrated from Go to Bun/TypeScript for better maintainability and unified toolchain with the frontend.

**Files Created:**

| File | Purpose |
|------|---------|
| `server.go` | HTTP server with middleware chain (CORS, logging), SPA handler for client-side routing |
| `handlers.go` | CRUD handlers that translate between frontend API and Kubernetes resources |
| `sse.go` | Server-Sent Events endpoint for real-time workspace list updates |
| `config.go` | Configuration struct and auth header constants |

**Key Design Decisions:**

- **SPA Handler:** Returns `index.html` for unknown routes, enabling React Router to handle client-side navigation
- **SSE over WebSocket:** Simpler protocol, works through proxies, sufficient for one-way updates
- **Polling in SSE:** Uses 5-second polling; production should use Kubernetes informers/watch

```go
// server.go - SPA handler for client-side routing
func (s *Server) spaHandler(fs http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        path := s.config.StaticDir + r.URL.Path
        _, err := os.Stat(path)
        if os.IsNotExist(err) {
            // File doesn't exist, serve index.html for SPA routing
            http.ServeFile(w, r, s.config.StaticDir+"/index.html")
            return
        }
        fs.ServeHTTP(w, r)
    })
}
```

---

### 2. WorkspaceAccessReview API (`api/connection/v1alpha1/workspace_access_review_types.go`)

**Why:** The existing `ConnectionAccessReview` only handles workspace *connection* permissions (can user connect to a running workspace). We needed a separate review type for workspace *CRUD* operations:

- Can user list workspaces?
- Can user create a workspace?
- Can user update/delete a specific workspace?

**Design:**

```go
type WorkspaceAccessReviewSpec struct {
    User          string   // Username from auth headers
    Groups        []string // User's groups
    WorkspaceName string   // Target workspace (empty for list/create)
    Verb          string   // create, get, list, update, delete
}

type WorkspaceAccessReviewStatus struct {
    Allowed bool   // Permission granted?
    Reason  string // Explanation for audit
}
```

**Why not reuse ConnectionAccessReview?**

- Different semantics: connection review checks if user can *access* a running workspace; this checks if user can *manage* workspace resources
- Different authorization logic: CRUD uses RBAC + ownership checks; connections use access strategy rules
- Separation of concerns: keeps the API surface clean and purpose-specific

---

### 3. WorkspaceAccessReview Handler (`internal/extensionapi/serverroute_workspace_access_review.go`)

**Why:** Implements the authorization logic for workspace CRUD operations.

**Authorization Flow:**

1. **RBAC Check:** Uses Kubernetes SubjectAccessReview to verify user has RBAC permission for the verb on `workspaces` resource
2. **Ownership Check:** For update/delete on private workspaces, verifies user is the owner

```go
func (s *ExtensionServer) checkWorkspacePermission(...) (*PermissionCheckResult, error) {
    // Step 1: RBAC check via SubjectAccessReview
    sarRequest := &authorizationv1.SubjectAccessReview{
        Spec: authorizationv1.SubjectAccessReviewSpec{
            ResourceAttributes: &authorizationv1.ResourceAttributes{
                Namespace: namespace,
                Verb:      verb,
                Group:     workspacev1alpha1.GroupVersion.Group,
                Resource:  "workspaces",
            },
            User:   username,
            Groups: groups,
        },
    }
    // ... check result ...

    // Step 2: Ownership check for private workspaces
    if (verb == "update" || verb == "delete") && workspaceName != "" {
        if workspace.Spec.OwnershipType == "OwnerOnly" {
            owner := workspace.Annotations["workspace.jupyter.org/created-by"]
            if owner != username {
                return denied("User is not the owner")
            }
        }
    }
}
```

**Why two-step authorization?**

- RBAC alone isn't sufficient: a user might have `update` permission on workspaces but shouldn't modify another user's private workspace
- Ownership is stored in annotations, not RBAC, so we need application-level checks
- This mirrors how the existing connection authorization works

---

### 4. Extension API Route Registration (`internal/extensionapi/server.go`)

**Change:** Added route registration for the new endpoint.

```go
// server.go
s.registerNamespacedRoutes(map[string]func(http.ResponseWriter, *http.Request){
    "workspaceconnections":   s.HandleConnectionCreate,
    "connectionaccessreview": s.handleConnectionAccessReview,
    "workspaceaccessreview":  s.handleWorkspaceAccessReview,  // NEW
})
```

**Why here?** The Extension API already handles authentication-related endpoints. Adding workspace access review here:
- Reuses existing infrastructure (logging, error handling, namespace extraction)
- Keeps all authorization endpoints in one place
- Follows the established pattern for `connectionaccessreview`

---

### 5. Makefile Targets

**Added:**

```makefile
UIBACKEND_IMG ?= uibackend:latest

docker-build-uibackend:
    $(CONTAINER_TOOL) build -t ${UIBACKEND_IMG} -f images/uibackend/Dockerfile .

docker-push-uibackend:
    $(CONTAINER_TOOL) push ${UIBACKEND_IMG}
```

**Why:** Separate image for the UI backend because:
- Different deployment lifecycle than the controller
- Can be scaled independently
- Smaller attack surface (doesn't need controller RBAC permissions)

---

### 6. Docker Image (`images/uibackend/Dockerfile`)

**Multi-stage build:**

1. **Node stage:** Builds React frontend with Vite
2. **Go stage:** Compiles UI backend binary
3. **Runtime stage:** Distroless image with binary + static files

**Why distroless?**
- Minimal attack surface (no shell, no package manager)
- Smaller image size
- Production best practice for Go services

---

### 7. Default Templates (`config/default-templates/`)

**Why:** Templates provide guardrails for workspace creation:
- Prevent users from requesting excessive resources
- Standardize images for security/compliance
- Enable idle shutdown by default to reduce costs

**Templates Created:**

| Template | Target Use Case | Key Constraints |
|----------|-----------------|-----------------|
| `starter` | Quick experiments | Max 2 CPU, 4GB RAM, 30min idle timeout |
| `data-science` | Jupyter notebooks | Max 4 CPU, 16GB RAM, SageMaker image |
| `ml-training` | GPU workloads | Max 8 CPU, 32GB RAM, longer idle timeout |
| `code-editor` | VS Code style | Max 4 CPU, 8GB RAM, code-server image |

---

## Frontend (`web/`)

React SPA built with Vite, Material UI, and React Query.

### Key Files

| Path | Purpose |
|------|---------|
| `src/App.tsx` | Route definitions with lazy loading |
| `src/api/client.ts` | API client with fetch wrapper |
| `src/api/hooks.ts` | React Query hooks for data fetching |
| `src/pages/WorkspaceList.tsx` | List view with search/filter |
| `src/pages/WorkspaceCreate.tsx` | Create form with template selection |
| `src/pages/WorkspaceDetail.tsx` | Detail view with conditions |
| `src/components/workspace/TemplateCard.tsx` | Template selection cards |
| `src/constants/strings.ts` | Centralized UI strings (i18n-ready) |
| `src/utils/workspace.ts` | Helper functions |

### Build Optimization

Vite config splits chunks for optimal loading:

```typescript
// vite.config.ts
manualChunks: {
  'vendor-react': ['react', 'react-dom', 'react-router-dom'],
  'vendor-mui': ['@mui/material', '@mui/system'],
  'vendor-query': ['@tanstack/react-query'],
}
```

Pages are lazy-loaded via `React.lazy()` for code splitting.

---

## Authentication Flow

```
User Request
     │
     ▼
┌─────────────┐
│   Traefik   │ ◄── Ingress controller
└─────────────┘
     │
     ▼
┌─────────────┐
│ oauth2-proxy│ ◄── OIDC authentication
└─────────────┘
     │ Sets headers:
     │ X-Auth-Request-User
     │ X-Auth-Request-Groups
     ▼
┌─────────────┐
│ UI Backend  │ ◄── Reads headers, calls Extension API
└─────────────┘
     │
     ▼
┌─────────────┐
│Extension API│ ◄── WorkspaceAccessReview
└─────────────┘
     │
     ▼
┌─────────────┐
│  K8s RBAC   │ ◄── SubjectAccessReview
└─────────────┘
```

---

## Running Locally

```bash
# Terminal 1: Start UI backend
make run-uibackend

# Terminal 2: Start frontend dev server
cd web && bun run dev
```

The frontend proxies `/api` requests to the backend via Vite config.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `UI_BACKEND_ADDR` | `:8090` | Backend listen address |
| `UI_BACKEND_NAMESPACE` | `default` | K8s namespace for workspaces |
| `UI_BACKEND_DEV_USER` | - | Fallback user for local dev |
| `UI_BACKEND_STATIC_DIR` | - | Path to frontend build |
| `EXTENSION_API_URL` | `http://localhost:8443` | Extension API endpoint |
