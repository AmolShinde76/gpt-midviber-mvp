# ---- Stage 1: Build React Frontend ----
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/my-app/package.json frontend/my-app/package-lock.json* ./
RUN npm install

COPY frontend/my-app/ ./

# Set API base URL to empty so frontend uses same-origin (Nginx proxies API)
ENV VITE_API_BASE_URL=""
RUN npm run build


# ---- Stage 2: Production Image ----
FROM python:3.11-slim

# Install Nginx and supervisor
RUN apt-get update && \
    apt-get install -y --no-install-recommends nginx supervisor curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Setup backend
WORKDIR /app/backend

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/api_server.py backend/search_context_simple.py backend/memory_manager.py backend/upload_file.py backend/start.py ./
COPY backend/documents/ ./documents/

# Copy built frontend to Nginx html directory
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Copy Nginx config
COPY nginx.conf /etc/nginx/sites-available/default

# Copy supervisor config
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose ports
EXPOSE 80 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
