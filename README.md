# Spark Initiative Frontend 2026

Frontend for Spark Initiative IV (2026), presenting the OS and RDMA learning tracks.

Live at [csinfra.cn](https://csinfra.cn/).

## Development

```bash
npm ci
npm run dev
```

## Deployment

Build the zero-JavaScript static site:

```bash
npm run build:static
```

The deployable output is written to `dist-static/`. Production is served by Nginx using versioned release directories and an atomic `current` symlink. The Nginx configuration is kept in [`deploy/nginx/csinfra.cn.conf`](deploy/nginx/csinfra.cn.conf).

## Acknowledgements

The product direction and final decisions are owned by the Spark Initiative team. Design exploration, copy refinement, frontend implementation, responsive polish, performance optimization, and deployment were completed with deep assistance from OpenAI Codex.
