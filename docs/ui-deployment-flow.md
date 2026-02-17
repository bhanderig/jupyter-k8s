# UI Deployment Flow to Kubernetes Cluster

This document provides comprehensive sequence diagrams showing how the web UI is built, containerized, deployed to the Kubernetes cluster, and how authentication works.

## 1. Deployment Sequence Diagram

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Git as Git Repository
    participant CI as CI/CD Pipeline
    participant Docker as Docker Build
    participant Registry as Container Registry
    participant Helm as Helm Chart
    participant K8s as Kubernetes API
    participant Traefik as Traefik Ingress
    participant Pod as Web App Pod

    Dev->>Git: Push code changes<br/>(web/src/, web/server-bun/)
    Git->>CI: Trigger build pipeline
    
    Note over CI,Docker: Build Phase
    CI->>Docker: Start multi-stage build
    Docker->>Docker: Stage 1: Builder (oven/bun:1)<br/>- Install dependencies<br/>- Build frontend (Vite)<br/>- Prepare backend (Bun)
    Docker->>Docker: Stage 2: Runtime (oven/bun:1-slim)<br/>- Copy dist/ and server-bun/<br/>- Install prod dependencies<br/>- Set user 1000:1000<br/>- Expose port 8090
    Docker->>Registry: Push image<br/>jk8s-application-web-app:latest
    
    Note over CI,Helm: Deployment Phase
    CI->>Helm: helm upgrade --install<br/>guided-charts/aws-traefik-dex
    Helm->>K8s: Create ServiceAccount<br/>web-app (NO permissions)
    Helm->>K8s: Create Deployment<br/>web-app (replicas: 1)
    Helm->>K8s: Create Service<br/>web-app:8090 (ClusterIP)
    Helm->>K8s: Create NetworkPolicy<br/>Ingress: Traefik only<br/>Egress: DNS + K8s API
    Helm->>K8s: Create IngressRoute<br/>Priority: 5, Path: /
    
    Note over K8s,Pod: Pod Startup
    K8s->>Registry: Pull image<br/>jk8s-application-web-app:latest
    Registry->>K8s: Return image
    K8s->>Pod: Create pod with:<br/>- ServiceAccount: web-app<br/>- Env: NODE_ENV=production<br/>- Port: 8090
    Pod->>Pod: Start Bun server<br/>bun run server-bun/index.ts
    Pod->>K8s: Readiness probe<br/>GET /api/v1/health
    K8s->>Pod: 200 OK
    K8s->>K8s: Mark pod Ready
    
    Note over Traefik,Pod: Routing Setup
    Traefik->>K8s: Watch IngressRoute resources
    K8s->>Traefik: IngressRoute: web-app<br/>Priority 5, Path: /
    Traefik->>Traefik: Configure route:<br/>domain.com/ → web-app:8090<br/>Middleware: oauth-auth-redirect
    
    Note over Dev,Pod: Deployment Complete
    Dev->>Traefik: Access https://domain.com/
    Traefik->>Pod: Forward request (after auth)
    Pod->>Dev: Serve React UI
```

## 2. Authentication Flow Sequence Diagram

```mermaid
sequenceDiagram
    participant User as User Browser
    participant Traefik as Traefik Ingress
    participant OAuth2 as OAuth2 Proxy
    participant Dex as Dex
    participant GitHub as GitHub OAuth
    participant WebApp as Web App Pod
    participant K8sAPI as Kubernetes API

    User->>Traefik: GET https://domain.com/
    
    Note over Traefik: Route Priority Check<br/>Priority 10: /dex, /oauth2<br/>Priority 5: / (web-app)
    
    Traefik->>OAuth2: Apply middleware<br/>oauth-auth-redirect
    OAuth2->>OAuth2: Check for auth cookie
    
    alt Not Authenticated
        OAuth2->>User: 302 Redirect to<br/>/dex/auth?redirect_uri=...
        User->>Dex: GET /dex/auth
        Dex->>User: 302 Redirect to GitHub
        User->>GitHub: OAuth2 authorization
        GitHub->>User: Show consent screen
        User->>GitHub: Approve access
        GitHub->>Dex: Authorization code
        Dex->>GitHub: Exchange code for token
        GitHub->>Dex: Access token + user info
        Dex->>Dex: Generate ID token (JWT)<br/>Claims: email, groups, etc.
        Dex->>OAuth2: Return ID token
        OAuth2->>OAuth2: Validate ID token
        OAuth2->>User: Set cookies:<br/>- _oauth2_proxy<br/>- id_token
        OAuth2->>User: 302 Redirect to original URL
    end
    
    User->>Traefik: GET https://domain.com/<br/>(with auth cookies)
    Traefik->>OAuth2: Apply middleware
    OAuth2->>OAuth2: Validate cookies
    OAuth2->>Traefik: Forward with headers:<br/>X-Auth-Request-Id-Token: <JWT><br/>X-Forwarded-User: github:username<br/>X-Forwarded-Email: user@example.com
    Traefik->>WebApp: Forward request + headers
    
    alt API Request (e.g., /api/v1/workspaces)
        WebApp->>WebApp: Extract JWT from<br/>X-Auth-Request-Id-Token
        WebApp->>K8sAPI: List workspaces<br/>Authorization: Bearer <JWT>
        Note over K8sAPI: RBAC checks user's<br/>GitHub team/org permissions
        K8sAPI->>K8sAPI: Authorize request<br/>based on user identity
        K8sAPI->>WebApp: Return workspaces<br/>(only user can access)
        WebApp->>User: JSON response
    else Static Asset (e.g., /, /index.html)
        WebApp->>WebApp: Serve from dist/<br/>React SPA
        WebApp->>User: HTML/JS/CSS
    end
    
    Note over User,K8sAPI: All K8s operations use<br/>user's JWT token<br/>NOT service account
```

## Key Configuration

### Helm Values (`values.yaml`)
```yaml
webApp:
  enabled: true
  replicas: 1
  image:
    repository: jk8s-application-web-app
    tag: latest
    pullPolicy: IfNotPresent
  namespace: default  # Where workspaces are managed
  resources:
    limits:
      cpu: 500m
      memory: 512Mi
    requests:
      cpu: 100m
      memory: 128Mi
```

### Kubernetes Resources

| Resource | Details |
|----------|---------|
| **ServiceAccount** | `web-app` - NO permissions (zero-trust) |
| **Deployment** | 1 replica, port 8090, non-root user (1000:1000) |
| **Service** | ClusterIP on port 8090 |
| **NetworkPolicy** | Ingress: Traefik only<br/>Egress: DNS + K8s API |
| **IngressRoute** | Priority 5, Path: `/`, Middleware: oauth-auth-redirect |

### Environment Variables
- `NODE_ENV=production`
- `PORT=8090`
- `NAMESPACE=default`
- `STATIC_DIR=./dist`

### Health Probes
- **Liveness**: `/api/v1/health` - 10s initial, 3s timeout
- **Readiness**: `/api/v1/health` - 5s initial, 3s timeout

## API Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/v1/health` | GET | Health check | None |
| `/api/v1/workspaces` | GET | List workspaces | User JWT |
| `/api/v1/workspaces` | POST | Create workspace | User JWT |
| `/api/v1/workspaces/:name` | GET | Get workspace | User JWT |
| `/api/v1/workspaces/:name` | DELETE | Delete workspace | User JWT |
| `/api/v1/templates` | GET | List templates | User JWT |
| `/` | GET | React SPA | OAuth2 |

## Key Files

## Deployment Commands

```bash
# Build Docker image
cd images
make web-app

# Or manually
docker build -f images/web-app/Dockerfile -t jk8s-application-web-app:latest .

# Deploy with Helm
helm upgrade --install jupyter-k8s-router \
  ./guided-charts/aws-traefik-dex \
  --values custom-values.yaml \
  --namespace jupyter-k8s-router

# Verify deployment
kubectl get pods -n jupyter-k8s-router -l app=web-app
kubectl logs -n jupyter-k8s-router -l app=web-app
```

## Security Features

1. **Zero-Permission Service Account**:
   - Web app pod has NO Kubernetes permissions
   - All operations use user's OAuth token
   - No privilege escalation possible

2. **Multi-layer Authentication**:
   - OAuth2 Proxy validates session
   - Dex handles OAuth with GitHub
   - Kubernetes RBAC enforces per-user permissions

3. **Network Isolation**:
   - NetworkPolicy restricts ingress to Traefik only
   - Egress limited to DNS and K8s API
   - No access to other cluster services

4. **Container Security**:
   - Non-root user (1000:1000)
   - All capabilities dropped
   - Read-only root filesystem (where possible)

5. **TLS Encryption**:
   - All traffic encrypted via Traefik
   - Automatic certificate management

6. **Token-based Authorization**:
   - User's OAuth token forwarded to K8s API
   - RBAC enforced per-user, per-request
   - No shared credentials

## Troubleshooting

```bash
# Check pod status
kubectl get pods -n jupyter-k8s-router -l app=web-app

# View logs
kubectl logs -n jupyter-k8s-router -l app=web-app -f

# Check service
kubectl get svc -n jupyter-k8s-router web-app

# Check ingress route
kubectl get ingressroute -n jupyter-k8s-router web-app -o yaml

# Verify route priority
kubectl get ingressroute -n jupyter-k8s-router -o yaml | grep -A 5 priority

# Test health endpoint (from within cluster)
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- \
  curl http://web-app.jupyter-k8s-router:8090/api/v1/health

# Check network policy
kubectl get networkpolicy -n jupyter-k8s-router web-app -o yaml

# Verify service account has no permissions (should fail)
kubectl auth can-i list workspaces \
  --as=system:serviceaccount:jupyter-k8s-router:web-app \
  -n default
# Expected: no
```
