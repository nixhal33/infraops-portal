# InfraOps Portal

InfraOps Portal is a full-stack infrastructure operations project built with React, FastAPI, MariaDB, Docker, Kubernetes, Helm, and ArgoCD.

The goal is to simulate a small internal IT operations platform that a real infrastructure team could deploy. Admins and operators can log in, view infrastructure health, manage assets such as servers and routers, create support tickets, expose metrics, deploy the system to Kubernetes, and practice production DevOps workflows.

## Why This Project Exists

This project was designed for Kubernetes and DevOps learning, not just basic web development. A simple portfolio site does not naturally require secrets, RBAC, persistent volumes, ingress, monitoring, backups, Helm, or GitOps. An infrastructure portal does.

InfraOps Portal gives you a realistic reason to practice:

- Frontend and backend service separation
- API authentication and authorization
- MariaDB persistent storage
- Docker image builds
- Docker Compose local testing
- Kubernetes Deployments, Services, StatefulSets, Ingress, Secrets, ConfigMaps, RBAC, NetworkPolicies, ResourceQuotas, and CronJobs
- Helm packaging
- ArgoCD GitOps deployment
- Prometheus and Grafana monitoring
- Loki-style centralized log workflow
- Database backup and restore thinking

## Feature Summary

| Area | Features |
| --- | --- |
| Authentication | Login, JWT tokens, current-user endpoint, seeded admin/operator users |
| Dashboard | Total assets, online assets, open tickets, critical tickets, summary bars |
| Assets | Create, list, and delete infrastructure assets |
| Tickets | Create, list, move between statuses, and delete support tickets |
| Users | Admin-only user list |
| Monitoring | Prometheus metrics endpoint and dashboard links |
| Local runtime | Docker Compose with frontend, backend, and MariaDB |
| Kubernetes | Full manifests for app, DB, ingress, RBAC, network policy, quota, backup |
| Helm | Parameterized production-style chart |
| ArgoCD | GitOps application manifest |

## Project Structure

```text
infraops-portal/
├── backend/
│   ├── app/
│   │   ├── api/routes/        FastAPI route modules
│   │   ├── core/              settings, database, security
│   │   ├── models/            SQLAlchemy database models
│   │   ├── schemas/           Pydantic request/response schemas
│   │   ├── services/          seed data and service helpers
│   │   └── main.py            FastAPI app entrypoint
│   ├── tests/                 backend tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/               API client and auth context
│   │   ├── components/        reusable UI components
│   │   ├── pages/             dashboard, assets, tickets, users, monitoring
│   │   └── styles.css
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── database/
│   └── init.sql               schema reference
├── kubernetes/
│   ├── base/                  direct kubectl manifests
│   └── monitoring/            Grafana and Prometheus examples
├── helm/
│   └── infraops-portal/       Helm chart
├── argocd/
│   └── infraops-application.yaml
├── docs/
│   └── ARCHITECTURE.md
├── docker-compose.yml
├── Makefile
└── README.md
```

## Technology Stack

| Layer | Choice | Reason |
| --- | --- | --- |
| Frontend | React + Vite | Fast dashboard development and easy static container build |
| UI icons | lucide-react | Clean operational icons without custom SVG work |
| Backend | FastAPI | Clear Python API code, OpenAPI docs, easy containerization |
| ORM | SQLAlchemy | Production-standard database abstraction |
| Auth | JWT + bcrypt hashing | Common API authentication pattern |
| Database | MariaDB | Real relational database with persistent storage |
| Local containers | Docker Compose | Simple full-stack local startup |
| Kubernetes packaging | YAML + Helm | Both learning-friendly and production-style deployment paths |
| GitOps | ArgoCD | Real desired-state deployment model |

## Architecture

```text
Browser
  |
  v
Ingress: infraops.local
  |
  +-- / ------------------> React frontend running in Nginx
  |
  +-- /api and /health ---> FastAPI backend
                              |
                              v
                           MariaDB
```

For a deeper architecture explanation, read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Default Accounts

The backend seeds two users the first time it starts with an empty database.

| Username | Password | Role |
| --- | --- | --- |
| admin | Admin@12345 | admin |
| operator | Operator@12345 | operator |

Change these before using the project anywhere public.

## Run Locally With Docker Compose

From the project root:

```bash
cp .env.example .env
docker compose up --build
```

Open:

```text
Frontend: http://localhost:8080
Backend API docs: http://localhost:8000/docs
Health check: http://localhost:8000/health
Metrics: http://localhost:8000/api/monitoring/metrics
```

Stop the stack:

```bash
docker compose down
```

Remove containers and the MariaDB volume:

```bash
docker compose down -v
```

## Run Backend Without Docker

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

By default, the backend uses a local SQLite database when `DATABASE_URL` is not set. Docker and Kubernetes set `DATABASE_URL` to MariaDB.

## Run Frontend Without Docker

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

The Vite dev server proxies `/api` and `/health` to the backend at `http://localhost:8000`.

## Backend API

### Authentication

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/login` | Return JWT token and user data |
| POST | `/api/auth/register` | Register user |
| GET | `/api/auth/me` | Return current authenticated user |

Login request:

```json
{
  "username": "admin",
  "password": "Admin@12345"
}
```

### Assets

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/assets` | List assets |
| POST | `/api/assets` | Create asset |
| PUT | `/api/assets/{id}` | Update asset |
| DELETE | `/api/assets/{id}` | Delete asset |

Asset example:

```json
{
  "hostname": "k8s-worker-01",
  "ip_address": "10.10.0.21",
  "asset_type": "server",
  "location": "DC-1 Rack A2",
  "status": "online"
}
```

Supported asset types:

```text
server, router, switch, vm, cluster, firewall
```

Supported asset statuses:

```text
online, warning, offline, maintenance
```

### Tickets

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/tickets` | List tickets |
| POST | `/api/tickets` | Create ticket |
| PUT | `/api/tickets/{id}` | Update ticket |
| DELETE | `/api/tickets/{id}` | Delete ticket |

Ticket example:

```json
{
  "title": "Router packet drops",
  "description": "Edge router shows packet drops during peak traffic.",
  "status": "open",
  "severity": "high",
  "asset_id": 1
}
```

Supported ticket statuses:

```text
open, in_progress, closed
```

Supported severity levels:

```text
low, medium, high, critical
```

### Users

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/users` | Admin-only user list |

### Monitoring

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/monitoring/summary` | Dashboard summary JSON |
| GET | `/api/monitoring/metrics` | Prometheus text metrics |
| GET | `/health` | App and database health |

## Database Design

The application uses three main tables.

```text
users
  id
  username
  email
  password_hash
  role
  created_at

assets
  id
  hostname
  ip_address
  asset_type
  location
  status
  created_at

tickets
  id
  title
  description
  status
  severity
  asset_id
  created_by
  created_at
```

Relationships:

- One user can create many tickets.
- One asset can have many tickets.
- A ticket can optionally be linked to an asset.

## Kubernetes Deployment With Raw Manifests

The direct manifests are in `kubernetes/base`.

Before applying them, build images into the cluster image runtime or push them to a registry and update the image names.

For local Docker:

```bash
docker build -t infraops-backend:1.0.0 ./backend
docker build -t infraops-frontend:1.0.0 ./frontend
```

For MicroK8s, one common approach is:

```bash
docker save infraops-backend:1.0.0 > infraops-backend.tar
docker save infraops-frontend:1.0.0 > infraops-frontend.tar
microk8s ctr image import infraops-backend.tar
microk8s ctr image import infraops-frontend.tar
```

Apply manifests:

```bash
kubectl apply -f kubernetes/base/
```

Check status:

```bash
kubectl get pods -n infraops
kubectl get svc -n infraops
kubectl get ingress -n infraops
```

For local host access, add this to `/etc/hosts` with the IP of your ingress controller:

```text
127.0.0.1 infraops.local
```

Then open:

```text
http://infraops.local
```

## Kubernetes Objects Included

| File | Purpose |
| --- | --- |
| `00-namespace.yaml` | Creates `infraops` and `monitoring` namespaces |
| `01-configmap.yaml` | Non-secret application configuration |
| `02-secret.yaml` | Database password and JWT secret |
| `03-rbac.yaml` | Service accounts and readonly role binding |
| `04-mariadb.yaml` | MariaDB service and StatefulSet |
| `05-backend.yaml` | FastAPI service and Deployment |
| `06-frontend.yaml` | React/Nginx service and Deployment |
| `07-ingress.yaml` | Host and path routing |
| `08-networkpolicy.yaml` | Default-deny and allowed traffic rules |
| `09-resourcequota.yaml` | Namespace CPU/memory/object limits |
| `10-backup-cronjob.yaml` | Daily MariaDB backup CronJob |

## Helm Deployment

The Helm chart is in:

```text
helm/infraops-portal
```

Install:

```bash
helm install infraops ./helm/infraops-portal
```

Upgrade:

```bash
helm upgrade infraops ./helm/infraops-portal
```

Uninstall:

```bash
helm uninstall infraops -n infraops
```

Customize values in:

```text
helm/infraops-portal/values.yaml
```

Important values:

```yaml
frontend:
  image: infraops-frontend:1.0.0

backend:
  image: infraops-backend:1.0.0
  jwtSecret: change-this-jwt-secret-before-production

mariadb:
  password: change-this-db-password
  rootPassword: change-this-root-password

ingress:
  host: infraops.local
```

## ArgoCD GitOps Deployment

The ArgoCD application manifest is:

```text
argocd/infraops-application.yaml
```

Before applying it, replace:

```text
https://github.com/your-username/infraops-portal.git
```

with your actual Git repository URL.

Apply:

```bash
kubectl apply -f argocd/infraops-application.yaml
```

ArgoCD will read the Helm chart and reconcile the cluster to match the repository.

## Monitoring

The backend exposes Prometheus metrics:

```text
GET /api/monitoring/metrics
```

Example output:

```text
infraops_assets_total 5
infraops_assets_offline 1
infraops_tickets_open 2
infraops_tickets_critical 1
```

Monitoring files:

```text
kubernetes/monitoring/prometheus-additional-scrape.yaml
kubernetes/monitoring/grafana-dashboard-configmap.yaml
```

The backend service also includes Prometheus scrape annotations.

## Logging

The backend and frontend write logs to container stdout/stderr. In Kubernetes, that makes logs available to:

```bash
kubectl logs -n infraops deploy/infraops-backend
kubectl logs -n infraops deploy/infraops-frontend
```

If Loki and Promtail are installed in the cluster, Promtail can collect these container logs and send them to Loki. Grafana can then query them from the Explore page.

The Monitoring page includes a Loki/Grafana link placeholder:

```text
http://grafana.infraops.local/explore
```

## Backups

The Kubernetes backup CronJob runs daily at 02:00:

```text
0 2 * * *
```

It executes `mariadb-dump` and writes SQL files into a backup PVC.

Check backup jobs:

```bash
kubectl get cronjob -n infraops
kubectl get jobs -n infraops
```

Manually create one backup job:

```bash
kubectl create job --from=cronjob/mariadb-backup manual-mariadb-backup -n infraops
```

## Security Notes

This project includes realistic security building blocks, but you should still change default values before any serious use.

Change these:

- `JWT_SECRET`
- `MYSQL_PASSWORD`
- `MYSQL_ROOT_PASSWORD`
- seeded demo passwords
- ArgoCD repository URL
- image names and registry locations

Recommended production improvements:

- Use External Secrets or Sealed Secrets instead of committing Kubernetes Secret values.
- Add TLS to the Ingress.
- Use a managed database or a production MariaDB operator.
- Add database migrations with Alembic.
- Add refresh tokens and account management.
- Add audit logs for destructive actions.
- Add CI/CD pipeline checks.

## Useful Commands

Build backend image:

```bash
docker build -t infraops-backend:1.0.0 ./backend
```

Build frontend image:

```bash
docker build -t infraops-frontend:1.0.0 ./frontend
```

Run backend tests:

```bash
cd backend
pytest
```

Build frontend:

```bash
cd frontend
npm install
npm run build
```

View backend logs in Kubernetes:

```bash
kubectl logs -n infraops deploy/infraops-backend -f
```

View database pod:

```bash
kubectl get pods -n infraops -l app=infraops-mariadb
```

Open API docs through port-forward:

```bash
kubectl port-forward -n infraops svc/infraops-backend 8000:8000
```

## Troubleshooting

### Frontend loads but login fails

Check backend health:

```bash
curl http://localhost:8000/health
```

For Kubernetes:

```bash
kubectl get pods -n infraops
kubectl logs -n infraops deploy/infraops-backend
```

### Backend cannot connect to MariaDB

Check the database pod:

```bash
kubectl get pods -n infraops -l app=infraops-mariadb
kubectl logs -n infraops statefulset/infraops-mariadb
```

Confirm the secret names match:

```bash
kubectl get secret infraops-secret -n infraops
```

### Ingress does not open in browser

Check the ingress controller is enabled and the host resolves:

```bash
kubectl get ingress -n infraops
cat /etc/hosts | grep infraops.local
```

For MicroK8s:

```bash
microk8s enable ingress
```

### Network policy blocks traffic

Temporarily inspect policies:

```bash
kubectl get networkpolicy -n infraops
```

The included policies allow ingress to frontend/backend, frontend to backend, backend to MariaDB, DNS, and common web egress.

## What To Explain In A Review

You can describe the project like this:

> I built InfraOps Portal, an infrastructure operations dashboard for tracking assets, support tickets, and health metrics. It uses React for the frontend, FastAPI for the API, MariaDB for persistent data, Docker for containerization, and Kubernetes for production-style deployment. I included Secrets, ConfigMaps, RBAC, NetworkPolicies, ResourceQuotas, Ingress, Helm, ArgoCD, Prometheus metrics, Grafana dashboard config, Loki log integration points, and MariaDB backups to practice real DevOps operations.

That explanation connects the application directly to Kubernetes, monitoring, and infrastructure work.

## Current Scope

This is a complete deployable v1. It intentionally keeps the business domain focused:

- Users
- Assets
- Tickets
- Monitoring summary
- Metrics
- Kubernetes operations

The next natural improvements would be comments on tickets, editable users, asset history, audit logs, alert rules, TLS, CI/CD, and database migrations.
