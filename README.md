# Cloudflare Workers + React + Convex Template

[cloudflarebutton]

A production-ready full-stack application template built with **Cloudflare Workers** for API routing, **React** with **shadcn/ui** for the frontend, and **Convex** for a reactive database, authentication, and file storage. Features secure email/password auth with OTP verification, file upload/management, responsive design with dark mode, and seamless deployment to Cloudflare.

## ✨ Features

- **Secure Authentication**: Email + password with OTP verification/reset, anonymous login support
- **File Management**: Upload, list, download, and delete user files with Convex storage
- **Modern UI**: shadcn/ui components, Tailwind CSS, responsive sidebar layout, dark/light theme
- **Reactive Backend**: Convex for real-time queries/mutations, schema-based TypeScript
- **API Layer**: Hono-based Cloudflare Workers for custom routes (extensible via `worker/userRoutes.ts`)
- **Developer Experience**: Hot reload, TypeScript end-to-end, error reporting, Convex dev tools
- **Production-Ready**: CORS, logging, health checks, client error reporting, atomic mutations

## 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | React 18, Vite, React Router, Tanstack Query, shadcn/ui, Tailwind CSS, Lucide Icons, Sonner (toasts) |
| **Backend** | Convex (Database/Auth/Storage), Cloudflare Workers, Hono |
| **Auth** | Convex Auth (Password + Email OTP via custom SMTP) |
| **Styling** | Tailwind CSS, Tailwind Animate, CSS Variables |
| **Utils** | Zod (validation), Immer (state), Framer Motion (animations) |
| **Dev Tools** | Bun, TypeScript, ESLint, Convex CLI, Wrangler |

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh) v1.1+
- [Cloudflare Account](https://dash.cloudflare.com) (free tier sufficient)
- [Convex Account](https://dashboard.convex.dev) (free tier)
- Environment variables: `VITE_CONVEX_URL`, `ANDROMO_SMTP_URL`, `ANDROMO_SMTP_API_KEY` (for email)

### Installation
```bash
# Clone & install dependencies
git clone <your-repo> && cd <your-repo>
bun install

# Set up Convex (runs automatically on first dev)
bunx convex dev

# Copy env template & configure
cp .env.example .env
# Edit .env with your Convex URL and SMTP details
```

### Development
```bash
# Start dev server (Cloudflare Worker + Vite + Convex)
bun dev

# Opens at http://localhost:3000 (or $PORT)
```

- Frontend: `http://localhost:3000`
- Convex Dashboard: Check terminal output
- Worker API: `/api/health`, `/api/*` (extensible)

## 💻 Usage

### Authentication
- Sign up/sign in with email + password
- Verify via 6-digit OTP sent to email
- Supports password reset and anonymous login
- Protected routes/queries auto-handle auth state

### File Management (Example)
```typescript
// Convex queries/mutations available via `api.files.*`
const files = useQuery(api.files.listFiles);
const { mutate } = useMutation(api.files.generateUploadUrl);

// Upload flow:
// 1. Generate presigned URL
// 2. Upload file via fetch
// 3. Save metadata
```

### Custom API Routes
Edit `worker/userRoutes.ts`:
```typescript
app.post('/api/custom', async (c) => {
  // Your logic here
  return c.json({ success: true });
});
```

### Extensibility
- **UI Components**: Add via shadcn CLI (`bunx shadcn@latest add <component>`)
- **Convex Functions**: `convex/files.ts`, `convex/auth.ts`
- **React Pages**: `src/pages/*.tsx`, Router in `src/main.tsx`
- **Sidebar**: Customize `src/components/app-sidebar.tsx`

## 🔧 Development Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Dev server (Worker + Frontend + Convex) |
| `bun build` | Build for production (deploys backend) |
| `bun lint` | Lint codebase |
| `bun cf-typegen` | Generate Worker types |
| `bunx convex dev` | Convex dev (hot reload backend) |
| `bunx convex dashboard` | Open Convex dashboard |

## ☁️ Deployment

Deploy to **Cloudflare** in minutes:

1. **Convex Backend**:
   ```bash
   bunx convex deploy
   # Set prod env vars in Convex dashboard
   ```

2. **Cloudflare Worker + Pages**:
   ```bash
   # Install Wrangler
   bun add -d wrangler

   # Deploy Worker (handles API + Assets)
   bun deploy
   ```

3. **Configure**:
   - Set `VITE_CONVEX_URL` in Pages env vars
   - Bind custom domain via Cloudflare dashboard

[cloudflarebutton]

Production URLs:
- Frontend: `<your-pages>.pages.dev`
- API: `<your-worker>.<account>.workers.dev/api/*`
- Convex: Managed serverlessly

## 🤝 Contributing

1. Fork & clone
2. `bun install`
3. Create feature branch (`feat/my-feature`)
4. `bun dev` & test
5. Commit: `git commit -m "feat: add feature"`
6. PR to `main`

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Credits

Built with ❤️ at Andromo. Template powered by Cloudflare Workers, Convex, and shadcn/ui.