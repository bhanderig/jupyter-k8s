# Jupyter K8s Web UI

A modern, lightweight web interface for managing Jupyter Workspaces on Kubernetes. Built with React, TypeScript, and Vite for the frontend, powered by a high-performance Bun backend.

## 🚀 Features

- **Workspace Management**: Create, view, update, and delete Jupyter workspaces
- **Template Support**: Use pre-configured workspace templates with resource limits
- **Real-time Status**: Live workspace status updates and health monitoring
- **Authentication**: Integrated OAuth2 authentication via Dex and GitHub
- **Responsive Design**: Modern, accessible UI that works on all devices
- **Zero-Trust Security**: User-scoped permissions enforced by Kubernetes RBAC

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Bun** v1.0.0 or higher ([installation guide](https://bun.sh/docs/installation))
- **Node.js** v18+ (for compatibility with some tooling)
- **kubectl** configured with access to your Kubernetes cluster
- **Access to a Kubernetes cluster** with the Jupyter K8s operator installed

### Installing Bun

```bash
# macOS, Linux, WSL
curl -fsSL https://bun.sh/install | bash

# Verify installation
bun --version
```

## 🏃 Quick Start

### 1. Clone and Install

```bash
# Navigate to the web directory
cd web

# Install dependencies
bun install
```

### 2. Configure Environment

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Required: Your OIDC ID token for authentication
DEV_ACCESS_TOKEN=your-jwt-token-here

# Optional: Override default settings
PORT=8090
NODE_ENV=development
NAMESPACE=default
```

**Getting your JWT token:**

```bash
# Option 1: Using kubectl oidc-login
kubectl oidc-login get-token \
  --oidc-issuer-url=https://your-dex-url/dex \
  --oidc-client-id=kubectl-oidc \
  --oidc-extra-scope=profile \
  --oidc-extra-scope=groups | jq -r '.status.token'

# Option 2: Extract from kubeconfig
kubectl config view --minify --raw -o jsonpath='{.users[0].user.exec.args}'
```

### 3. Run Development Server

```bash
# Start both frontend and backend
bun run dev:full

# Or run them separately:
# Terminal 1 - Frontend (Vite dev server)
bun run dev

# Terminal 2 - Backend (Bun server with hot reload)
bun run dev:server
```

The application will be available at:
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend API**: http://localhost:8090 (Bun server)

## 🏗️ Project Structure

```
web/
├── src/                      # Frontend source code
│   ├── api/                  # API client and React Query hooks
│   ├── components/           # React components
│   │   ├── ui/              # Reusable UI components
│   │   ├── workspace/       # Workspace-specific components
│   │   └── layout/          # Layout components
│   ├── pages/               # Page components (routes)
│   ├── context/             # React context providers
│   ├── hooks/               # Custom React hooks
│   ├── styles/              # Global styles and CSS modules
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   └── main.tsx             # Application entry point
├── server-bun/              # Backend server (Bun)
│   ├── index.ts             # Server entry point
│   └── k8s.ts               # Kubernetes client utilities
├── public/                  # Static assets
├── dist/                    # Production build output
└── package.json             # Dependencies and scripts
```

## 🛠️ Development

### Available Scripts

```bash
# Development
bun run dev              # Start frontend dev server (Vite)
bun run dev:server       # Start backend with hot reload
bun run dev:full         # Start both frontend and backend

# Building
bun run build            # Build frontend for production
bun run build:full       # Build both frontend and backend

# Linting
bun run lint             # Run ESLint

# Preview
bun run preview          # Preview production build locally

# Production
bun run start            # Start production server
```

### Code Style

This project uses ESLint with TypeScript support. Run the linter before committing:

```bash
bun run lint
```

### Hot Module Replacement (HMR)

The development setup includes:
- **Frontend HMR**: Vite provides instant updates for React components
- **Backend Hot Reload**: Bun's `--watch` flag automatically restarts the server on changes

## 🧪 Testing

### Manual Testing

1. **Health Check**:
   ```bash
   curl http://localhost:8090/api/v1/health
   ```

2. **List Workspaces**:
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8090/api/v1/workspaces
   ```

3. **Get Current User**:
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8090/api/v1/me
   ```

### Testing with kubectl

Verify your Kubernetes connection:

```bash
# List workspaces
kubectl get workspaces

# List templates
kubectl get workspacetemplates

# Check RBAC permissions
kubectl auth can-i list workspaces
kubectl auth can-i create workspaces
```

## 📦 Building for Production

### Build the Application

```bash
# Build frontend and backend
bun run build:full

# Or build separately
bun run build          # Frontend only
bun run build:server   # Backend only (no-op for Bun)
```

### Docker Build

```bash
# Build Docker image
docker build -t jupyter-k8s-ui:latest -f ../images/web-app/Dockerfile ..

# Run container locally
docker run -p 8090:8090 \
  -e NODE_ENV=production \
  -e NAMESPACE=default \
  jupyter-k8s-ui:latest
```

### Deploy to Kubernetes

The web UI is deployed as part of the Jupyter K8s Helm chart:

```bash
# Deploy with Helm
helm upgrade --install jupyter-k8s-router \
  ../guided-charts/aws-traefik-dex \
  --set webApp.enabled=true \
  --set webApp.image.tag=latest
```

See [deployment documentation](../docs/ui-deployment-flow.md) for detailed deployment instructions.

## 🤝 Contributing

We welcome contributions to both the frontend and backend! Please see our [Contributing Guide](./CONTRIBUTING.md) for detailed information on:

- Setting up your development environment
- Code style guidelines and best practices
- Testing procedures
- Pull request process
- Areas where we need help

Quick links:
- 🐛 [Report a bug](https://github.com/jupyter-infra/jupyter-k8s/issues/new?labels=bug)
- ✨ [Request a feature](https://github.com/jupyter-infra/jupyter-k8s/issues/new?labels=enhancement)
- 💬 [Ask a question](https://github.com/jupyter-infra/jupyter-k8s/discussions)

## 🔒 Security

### Authentication Flow

1. User accesses the web UI through Traefik ingress
2. OAuth2 Proxy validates the session
3. Dex handles OAuth with GitHub
4. JWT token is forwarded to the backend
5. Backend uses the token for all Kubernetes API calls
6. Kubernetes RBAC enforces per-user permissions

### Security Best Practices

- **Never commit `.env` files** - they contain sensitive tokens
- **Use environment variables** for all configuration
- **Rotate tokens regularly** - JWT tokens should be short-lived
- **Follow least privilege** - only request necessary Kubernetes permissions
- **Review RBAC policies** - ensure users have appropriate access levels

### Reporting Security Issues

If you discover a security vulnerability, please email the maintainers directly rather than opening a public issue.

## 📖 API Documentation

### Backend Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/v1/health` | GET | Health check | No |
| `/api/v1/me` | GET | Get current user info | Yes |
| `/api/v1/workspaces` | GET | List workspaces | Yes |
| `/api/v1/workspaces` | POST | Create workspace | Yes |
| `/api/v1/workspaces/:name` | GET | Get workspace details | Yes |
| `/api/v1/workspaces/:name` | PUT | Update workspace | Yes |
| `/api/v1/workspaces/:name` | DELETE | Delete workspace | Yes |
| `/api/v1/templates` | GET | List workspace templates | Yes |

### Request/Response Examples

See [server-bun/README.md](./server-bun/README.md) for detailed API documentation.

## 🐛 Troubleshooting

### Common Issues

**Issue**: `403 Forbidden` when accessing workspaces

**Solution**: Verify your JWT token has the correct claims:
```bash
# Decode your token (paste token after 'Bearer ')
echo "YOUR_JWT_TOKEN" | cut -d'.' -f2 | base64 -d | jq
```

Ensure it contains:
- `groups`: Your GitHub teams
- `preferred_username`: Your GitHub username
- Valid `exp` (expiration) timestamp

---

**Issue**: Cannot connect to Kubernetes cluster

**Solution**: Verify kubectl configuration:
```bash
kubectl cluster-info
kubectl auth can-i list workspaces
```

---

**Issue**: Bun command not found

**Solution**: Install Bun or add it to your PATH:
```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc  # or ~/.zshrc
```

---

**Issue**: Port 8090 already in use

**Solution**: Change the port in `.env`:
```bash
PORT=3000
```

## 📚 Additional Resources

- [Jupyter K8s Documentation](../README.md)
- [Deployment Guide](../docs/ui-deployment-flow.md)
- [Bun Documentation](https://bun.sh/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Kubernetes Client Documentation](https://github.com/kubernetes-client/javascript)

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/jupyter-infra/jupyter-k8s/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jupyter-infra/jupyter-k8s/discussions)
- **Documentation**: [Project Wiki](https://github.com/jupyter-infra/jupyter-k8s/wiki)
