# Contributing to Jupyter K8s Web UI

Thank you for your interest in contributing! This guide will help you get started with developing the Jupyter K8s Web UI.

## 🚀 Getting Started

### Prerequisites

- **Bun** v1.0.0+ ([installation guide](https://bun.sh/docs/installation))
- **Node.js** v18+ (for tooling compatibility)
- **kubectl** configured with cluster access
- **Git** for version control
- **A Kubernetes cluster** with Jupyter K8s operator installed

### Development Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/jupyter-k8s.git
   cd jupyter-k8s/web
   ```

3. **Install dependencies**:
   ```bash
   bun install
   ```

4. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your JWT token and settings
   ```

5. **Start development servers**:
   ```bash
   # Start both frontend and backend
   bun run dev:full
   
   # Or separately:
   bun run dev          # Frontend only (Vite)
   bun run dev:server   # Backend only (Bun)
   ```

6. **Verify setup**:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8090
   - Health check: http://localhost:8090/api/v1/health

## 📁 Project Structure

```
web/
├── src/                      # Frontend source
│   ├── api/                  # API client & React Query hooks
│   ├── components/           # React components
│   │   ├── ui/              # Reusable UI components
│   │   ├── workspace/       # Workspace-specific components
│   │   └── layout/          # Layout components
│   ├── pages/               # Page components (routes)
│   ├── context/             # React context providers
│   ├── hooks/               # Custom React hooks
│   ├── styles/              # Global styles & CSS modules
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions
├── server-bun/              # Backend server
│   ├── index.ts             # Server entry point
│   └── k8s.ts               # Kubernetes client
├── public/                  # Static assets
└── dist/                    # Production build output
```

## 🎯 How to Contribute

### 1. Find an Issue

- Browse [open issues](https://github.com/jupyter-infra/jupyter-k8s/issues)
- Look for issues labeled `good first issue` or `help wanted`
- Or propose a new feature by opening an issue first

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

### 3. Make Your Changes

Follow the guidelines below for code quality and consistency.

### 4. Test Your Changes

```bash
# Run linter
bun run lint

# Build to verify no errors
bun run build

# Test locally
bun run dev:full
```

### 5. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add workspace filtering by status"
```

Commit message format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test additions/updates
- `chore:` - Build process or auxiliary tool changes

### 6. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then open a pull request on GitHub with:
- Clear title describing the change
- Description of what changed and why
- Link to related issues
- Screenshots for UI changes

## 💻 Development Guidelines

### TypeScript

- **Use TypeScript** for all new code
- **Define types** for all props, state, and API responses
- **Avoid `any`** - use proper types or `unknown`
- **Export types** from `src/types/` for reusability

Example:
```typescript
// Good
interface WorkspaceCardProps {
  workspace: Workspace;
  onDelete: (name: string) => void;
}

// Avoid
interface WorkspaceCardProps {
  workspace: any;
  onDelete: Function;
}
```

### React Components

- **Functional components** with hooks (no class components)
- **Small, focused components** - single responsibility
- **Props destructuring** for clarity
- **CSS Modules** for component styles
- **Meaningful names** - describe what the component does

Example:
```typescript
// Good
export function WorkspaceCard({ workspace, onDelete }: WorkspaceCardProps) {
  return (
    <div className={styles.card}>
      {/* ... */}
    </div>
  );
}

// Avoid
export function Card(props: any) {
  return <div>{props.children}</div>;
}
```

### State Management

- **React Query** for server state (API data)
- **React Context** for global UI state (theme, auth)
- **Local state** (useState) for component-specific state
- **Avoid prop drilling** - use context when needed

### API Integration

- **Use React Query hooks** from `src/api/hooks.ts`
- **Handle loading states** with skeletons or spinners
- **Handle errors** with user-friendly messages
- **Optimistic updates** for better UX

Example:
```typescript
const { data: workspaces, isLoading, error } = useWorkspaces();

if (isLoading) return <Skeleton />;
if (error) return <Alert severity="error">{error.message}</Alert>;
```

### Styling

- **CSS Modules** for component styles (`.module.css`)
- **CSS variables** for theming (see `src/styles/variables.css`)
- **Mobile-first** responsive design
- **Accessibility** - proper ARIA labels, keyboard navigation

Example:
```css
/* WorkspaceCard.module.css */
.card {
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

@media (max-width: 768px) {
  .card {
    padding: var(--spacing-sm);
  }
}
```

### Backend (Bun Server)

- **TypeScript** for all server code
- **Error handling** with proper HTTP status codes
- **Token validation** for protected endpoints
- **JSDoc comments** for public functions
- **No logging of tokens** or sensitive data

Example:
```typescript
/**
 * List all workspaces accessible by the authenticated user
 */
server.get('/api/v1/workspaces', async (req) => {
  const token = extractToken(req);
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  try {
    const workspaces = await k8sClient.listWorkspaces(namespace, token);
    return Response.json(workspaces);
  } catch (error) {
    console.error('Failed to list workspaces:', error.message);
    return new Response(
      JSON.stringify({ error: 'Failed to list workspaces' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

## 🧪 Testing

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] All pages load without errors
- [ ] Workspace CRUD operations work
- [ ] Error states display properly
- [ ] Loading states show correctly
- [ ] Responsive design works on mobile
- [ ] Keyboard navigation works
- [ ] Dark/light theme switching works
- [ ] API endpoints return expected data

### Browser Testing

Test in:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

### API Testing

```bash
# Health check
curl http://localhost:8090/api/v1/health

# List workspaces
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8090/api/v1/workspaces
```

## 🎨 UI/UX Guidelines

### Design Principles

- **Simplicity** - Keep interfaces clean and uncluttered
- **Consistency** - Use existing components and patterns
- **Feedback** - Provide clear feedback for user actions
- **Accessibility** - Ensure all users can use the interface

### Component Library

Reuse existing components from `src/components/ui/`:
- `Button` - Primary, secondary, danger variants
- `Card` - Container for content
- `TextField` - Form inputs
- `Alert` - Success, error, warning, info messages
- `Dialog` - Modal dialogs
- `Skeleton` - Loading placeholders

### Accessibility

- **Semantic HTML** - Use proper elements (`<button>`, `<nav>`, etc.)
- **ARIA labels** - Add labels for screen readers
- **Keyboard navigation** - All actions accessible via keyboard
- **Focus indicators** - Visible focus states
- **Color contrast** - WCAG AA compliant

Example:
```typescript
<button
  onClick={handleDelete}
  aria-label={`Delete workspace ${workspace.name}`}
  className={styles.deleteButton}
>
  <TrashIcon aria-hidden="true" />
</button>
```

## 🔒 Security Guidelines

### Never Commit Secrets

- **No tokens** in code or commits
- **Use `.env`** for local secrets (already in `.gitignore`)
- **Use `.env.example`** for documentation only
- **Review diffs** before committing

### Token Handling

- **Never log tokens** - even in development
- **Validate tokens** before use
- **Use HTTPS** in production
- **Short-lived tokens** - refresh regularly

### Input Validation

- **Validate user input** on both frontend and backend
- **Sanitize data** before displaying
- **Prevent XSS** - use React's built-in escaping
- **Validate API responses** - don't trust external data

## 📝 Documentation

### Code Comments

- **JSDoc** for functions and complex logic
- **Inline comments** for non-obvious code
- **TODO comments** for future improvements

Example:
```typescript
/**
 * Extracts JWT token from Authorization header or X-Auth-Request-Id-Token
 * @param req - HTTP request object
 * @returns JWT token string or null if not found
 */
function extractToken(req: Request): string | null {
  // Check Authorization header first (development)
  const authHeader = req.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check X-Auth-Request-Id-Token (production via OAuth2 Proxy)
  return req.headers.get('X-Auth-Request-Id-Token');
}
```

### README Updates

Update relevant README files when:
- Adding new features
- Changing configuration
- Adding new dependencies
- Modifying API endpoints

## 🐛 Reporting Bugs

When reporting bugs, include:

1. **Description** - What happened vs. what you expected
2. **Steps to reproduce** - Detailed steps to recreate the issue
3. **Environment** - Browser, OS, Bun version, etc.
4. **Screenshots** - If applicable
5. **Console errors** - Browser console or server logs

## 💡 Suggesting Features

When suggesting features:

1. **Use case** - Why is this feature needed?
2. **Proposed solution** - How should it work?
3. **Alternatives** - Other approaches considered
4. **Mockups** - UI mockups if applicable

## 📋 Pull Request Checklist

Before submitting:

- [ ] Code follows project style guidelines
- [ ] TypeScript types are properly defined
- [ ] Linter passes (`bun run lint`)
- [ ] Build succeeds (`bun run build`)
- [ ] Tested locally with `bun run dev:full`
- [ ] No console errors or warnings
- [ ] README updated if needed
- [ ] Commit messages are clear and descriptive
- [ ] No secrets or tokens committed

## 🤝 Code Review Process

1. **Automated checks** run on PR (linting, build)
2. **Maintainer review** - usually within 2-3 days
3. **Address feedback** - make requested changes
4. **Approval** - maintainer approves PR
5. **Merge** - maintainer merges to main branch

## 📚 Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Bun Documentation](https://bun.sh/docs)
- [Kubernetes JavaScript Client](https://github.com/kubernetes-client/javascript)
- [React Query Documentation](https://tanstack.com/query/latest)

## 💬 Getting Help

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and general discussion
- **Project Wiki** - For detailed documentation

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Jupyter K8s Web UI! 🎉
