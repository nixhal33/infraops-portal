# 03 - Docker And Runtime

## Main Goal

Make the app run live with Docker Compose and verify the full browser-facing path.

## Docker Compose Fixes

1. Checked Compose config:

   ```bash
   docker compose config
   ```

   Purpose: verify final service definitions and environment variables.

2. Fixed frontend API build argument:

   Problem:

   ```text
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

   This works only when the browser can directly access backend port `8000`. It is weaker for containerized frontend routing.

   Fix:

   ```text
   VITE_API_BASE_URL=/api
   ```

3. Added backend network alias:

   ```yaml
   networks:
     default:
       aliases:
         - infraops-backend
   ```

   Purpose: make frontend nginx resolve `infraops-backend` inside Docker Compose, matching the Kubernetes service name.

4. Updated `.env.example`:

   ```text
   VITE_API_BASE_URL=/api
   ```

## Build Verification

1. Built Docker images:

   ```bash
   docker compose build
   ```

   Result:

   1. Frontend image built successfully.
   2. Vite production build passed.
   3. Backend image built successfully.
   4. Python dependencies installed successfully.

2. Rebuilt backend after code fixes:

   ```bash
   docker compose build backend
   ```

   Purpose: include the CORS and seed fixes.

## Runtime Verification

1. Started the full stack:

   ```bash
   docker compose up -d
   ```

2. Compose started in this order:

   1. MariaDB container created and started.
   2. MariaDB became healthy.
   3. Backend container started.
   4. Backend became healthy.
   5. Frontend container started.

3. Checked container status:

   ```bash
   docker compose ps
   ```

   Result:

   1. `infraops-mariadb` running and healthy.
   2. `infraops-backend` running and healthy.
   3. `infraops-frontend` running.

4. Checked backend health directly:

   ```bash
   curl -fsS http://localhost:8000/health
   ```

   Result:

   ```json
   {"status":"ok","database":"connected"}
   ```

5. Checked frontend-to-backend health proxy:

   ```bash
   curl -fsS http://localhost:8080/health
   ```

   Result:

   ```json
   {"status":"ok","database":"connected"}
   ```

6. Checked metrics through frontend proxy:

   ```bash
   curl -fsS http://localhost:8080/api/monitoring/metrics
   ```

   Result included:

   ```text
   infraops_assets_total 5
   infraops_assets_offline 1
   infraops_tickets_open 2
   infraops_tickets_critical 1
   ```

7. Checked frontend page:

   ```bash
   curl -fsS http://localhost:8080
   ```

   Result: returned the React production `index.html`.

8. Checked login through frontend proxy:

   ```bash
   curl -fsS -H 'Content-Type: application/json' \
     -d '{"username":"admin","password":"Admin@12345"}' \
     http://localhost:8080/api/auth/login
   ```

   Result: login succeeded and returned JWT token plus admin user data.

