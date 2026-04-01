<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

### Project overview
"Read Chinese or Die" — a client-side Chinese character learning PWA (Next.js 16, React 19, Tailwind CSS 4, Tesseract.js OCR, Hanzi Writer). Purely static export (`output: 'export'`); no backend, no database, no API routes, no Docker.

### Package manager
Uses **Bun** (`bun.lock`). Install: `curl -fsSL https://bun.sh/install | bash` then add `~/.bun/bin` to PATH.

### Key commands
| Task | Command |
|------|---------|
| Install deps | `bun install` |
| Dev server | `bun run dev` (port 3000) |
| Lint | `bun run lint` |
| Build | `bun run build` (static export to `dist/`) |

### Caveats
- The app requires camera access (getUserMedia). In headless/VM environments the UI shows "Camera Access Denied — Requested device not found"; this is expected and not a bug.
- No automated test suite exists; validation is manual via lint + build + browser.
- `next.config.ts` sets `typescript: { ignoreBuildErrors: true }`, so TypeScript errors won't fail the build.
