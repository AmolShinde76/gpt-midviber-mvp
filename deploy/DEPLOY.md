# Deployment — document-search

Single-container deployment behind the existing host nginx. Frontend **and** backend
are served same-origin from **https://gpt.medviberpro.com**. The backend (`:8000`)
stays internal to the container and is never exposed to the internet.

```
Browser ──HTTPS──▶ host nginx (gpt.medviberpro.com, TLS)
                        │ proxy_pass 127.0.0.1:8080
                        ▼
              docker "document-search" (:80 internal nginx)
                        ├─ serves React build
                        └─ proxies /ask /journals /health /pdf/ ─▶ uvicorn :8000 (same container)
```

## How it builds & ships
- Every push to `master` triggers [`.github/workflows/docker-publish.yml`](../.github/workflows/docker-publish.yml),
  which builds the image and pushes `ghcr.io/amolshinde76/gpt-midviber-mvp:latest`.
- The server just **pulls** that image — no building on the VPS.

---

## First-time setup on the server (88.222.241.107)

### 1. Get the deploy files onto the server
```bash
mkdir -p /opt/document-search && cd /opt/document-search
# copy deploy/docker-compose.yml and deploy/.env.example here (scp or git)
cp .env.example .env
nano .env          # set OPENAI_API_KEY (and confirm ALLOWED_ORIGINS=https://gpt.medviberpro.com)
```

### 2. Log in to GHCR (one time)
The package is private by default. Create a GitHub PAT with `read:packages`, then:
```bash
echo <YOUR_PAT> | docker login ghcr.io -u AmolShinde76 --password-stdin
```
(Or make the package public in GitHub → Packages → package settings, and skip login.)

### 3. Stop the OLD deployment first (avoid port/duplication conflicts)
```bash
# the old exited container
docker rm -f medviber 2>/dev/null || true

# the host uvicorn process currently on 127.0.0.1:8000 (it's replaced by the container)
sudo systemctl stop medviber-api   2>/dev/null || true   # if it's a systemd service
# or, if it was launched manually, find & kill it:
sudo lsof -i :8000        # identify the PID, then: kill <PID>
```
> The container's `8000` is internal only, so freeing the host's `8000` isn't strictly
> required — but stop the old process so you don't run two copies of the app.

### 4. Start the container
```bash
docker compose pull
docker compose up -d
docker compose logs -f          # watch it boot; Ctrl-C to detach
curl -f http://127.0.0.1:8080/health   # should return OK
```

### 5. Wire up host nginx for the domain
```bash
sudo cp nginx-gpt.medviberpro.com.conf /etc/nginx/sites-available/gpt.medviberpro.com
sudo ln -sf /etc/nginx/sites-available/gpt.medviberpro.com /etc/nginx/sites-enabled/
# if a different config already owns gpt.medviberpro.com, merge instead of duplicating
sudo nginx -t && sudo systemctl reload nginx
```

### 6. TLS
If certs don't already exist for the domain:
```bash
sudo certbot --nginx -d gpt.medviberpro.com
```

Visit **https://gpt.medviberpro.com** — frontend loads, and asking a question streams
back through the same origin.

---

## Updating (redeploy a new version)
```bash
cd /opt/document-search
docker compose pull && docker compose up -d
docker image prune -f
```

## Rollback
```bash
# pin a specific commit-sha tag instead of :latest in docker-compose.yml, e.g.
#   image: ghcr.io/amolshinde76/gpt-midviber-mvp:<sha>
docker compose pull && docker compose up -d
```

## Troubleshooting
- **502 from nginx** → container not up or unhealthy: `docker compose ps`, `docker compose logs`.
- **Streaming answer arrives all at once** → buffering not disabled on the `/ask` host
  block; confirm `proxy_buffering off;` is present (it is in the provided config).
- **Backend exits on boot with API-key error** → `OPENAI_API_KEY` missing/placeholder in `.env`.
- **`docker compose pull` denied** → not logged in to GHCR (step 2) or package is private.
