# 05 - Final Runbook

## Main Goal

Use this file when you want to run, verify, stop, or troubleshoot InfraOps Portal.

## Run The App

1. Go to project root:

   ```bash
   cd /home/nixhal/github_repos/tech-monitor/infraops-portal
   ```

2. Start the stack:

   ```bash
   docker compose up -d
   ```

3. Open the app:

   ```text
   http://localhost:8080
   ```

4. Login:

   ```text
   Username: admin
   Password: Admin@12345
   ```

## Verify The App

1. Check containers:

   ```bash
   docker compose ps
   ```

2. Check backend health:

   ```bash
   curl -fsS http://localhost:8000/health
   ```

3. Check frontend proxy health:

   ```bash
   curl -fsS http://localhost:8080/health
   ```

4. Check metrics:

   ```bash
   curl -fsS http://localhost:8080/api/monitoring/metrics
   ```

5. Check login API:

   ```bash
   curl -fsS -H 'Content-Type: application/json' \
     -d '{"username":"admin","password":"Admin@12345"}' \
     http://localhost:8080/api/auth/login
   ```

## Rebuild After Code Changes

1. Rebuild everything:

   ```bash
   docker compose build
   ```

2. Recreate containers:

   ```bash
   docker compose up -d
   ```

3. Rebuild only backend:

   ```bash
   docker compose build backend
   docker compose up -d backend frontend
   ```

4. Rebuild only frontend:

   ```bash
   docker compose build frontend
   docker compose up -d frontend
   ```

## Stop The App

1. Stop containers but keep database volume:

   ```bash
   docker compose down
   ```

2. Stop containers and remove database volume:

   ```bash
   docker compose down -v
   ```

   Warning: this removes local MariaDB data.

## Troubleshooting

1. If frontend opens but login fails:

   ```bash
   docker compose logs --tail=120 backend
   ```

2. If database is not healthy:

   ```bash
   docker compose logs --tail=120 mariadb
   ```

3. If frontend proxy does not work:

   ```bash
   docker compose logs --tail=120 frontend
   ```

4. If Kubernetes deployment is next:

   ```bash
   helm lint helm/infraops-portal
   helm template infraops helm/infraops-portal
   ```

