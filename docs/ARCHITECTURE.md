# InfraOps Portal Architecture

InfraOps Portal is a production-shaped learning project for infrastructure, monitoring, and Kubernetes practice. It is intentionally more realistic than a simple portfolio app because it includes application code, a database, container builds, Kubernetes manifests, Helm, ArgoCD, metrics, logging integration points, RBAC, network policies, and backups.

## Logical Architecture

```text
User Browser
    |
    | HTTP
    v
Ingress Controller
    |
    +-- / --------------------> React Frontend Service
    |
    +-- /api and /health -----> FastAPI Backend Service
                                  |
                                  | SQLAlchemy + PyMySQL
                                  v
                              MariaDB StatefulSet
```

## Application Components

| Component | Technology | Purpose |
| --- | --- | --- |
| Frontend | React + Vite + Nginx | Browser dashboard for admins and operators |
| Backend | FastAPI + SQLAlchemy | REST API, authentication, business logic, metrics |
| Database | MariaDB | Persistent storage for users, assets, and tickets |
| Local runtime | Docker Compose | Easy laptop testing before Kubernetes |
| Kubernetes runtime | Deployments, StatefulSet, Services, Ingress | Production-style orchestration |
| Helm | Helm chart | Parameterized deployment package |
| ArgoCD | Application manifest | GitOps deployment controller |
| Monitoring | Prometheus scrape endpoint, Grafana dashboard config | Operational visibility |
| Logging | Loki/Grafana integration point | Centralized log exploration |
| Backup | Kubernetes CronJob | MariaDB dump backup workflow |

## Data Model

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
  asset_id -> assets.id
  created_by -> users.id
  created_at
```

## Role Model

| Role | Capability |
| --- | --- |
| admin | Can view users, manage assets, manage tickets |
| operator | Can manage assets and tickets |
| viewer | Can view dashboards/assets/tickets and create tickets |

## API Boundary

The frontend never talks to MariaDB directly. It calls FastAPI endpoints under `/api`. FastAPI validates the JWT token, checks role permissions, executes database operations, and returns JSON.

Important endpoints:

```text
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me

GET    /api/assets
POST   /api/assets
PUT    /api/assets/{id}
DELETE /api/assets/{id}

GET    /api/tickets
POST   /api/tickets
PUT    /api/tickets/{id}
DELETE /api/tickets/{id}

GET /api/users
GET /api/monitoring/summary
GET /api/monitoring/metrics
GET /health
```

## Kubernetes Architecture

```text
Namespace: infraops

Ingress
  host: infraops.local
  paths:
    /      -> frontend service
    /api   -> backend service
    /health -> backend service

Frontend Deployment
  replicas: 2
  serviceAccount: frontend-sa
  container: nginx serving React build

Backend Deployment
  replicas: 2
  serviceAccount: backend-sa
  container: uvicorn FastAPI app
  env: DATABASE_URL, JWT_SECRET

MariaDB StatefulSet
  replicas: 1
  persistent volume claim

Backup CronJob
  daily mariadb-dump
  persistent backup PVC
```

## Network Policy Intent

The manifests include a default-deny policy and then allow the minimum application paths:

| Flow | Why it is allowed |
| --- | --- |
| Ingress controller to frontend/backend | Users need to access the app |
| Frontend pod to backend pod | Internal app calls if needed |
| Backend pod to MariaDB pod | API needs database access |
| DNS egress | Pods need service discovery |
| HTTP/HTTPS egress | Image/runtime integrations and future webhook use |

## Observability

FastAPI exposes simple Prometheus metrics at:

```text
/api/monitoring/metrics
```

Current metrics:

```text
infraops_assets_total
infraops_assets_offline
infraops_tickets_open
infraops_tickets_critical
```

The Kubernetes backend service contains scrape annotations. A sample Prometheus scrape config and Grafana dashboard ConfigMap are included in `kubernetes/monitoring`.

## GitOps Flow

```text
Developer pushes code/manifests to Git
    |
    v
ArgoCD watches the repository
    |
    v
ArgoCD renders Helm chart
    |
    v
Kubernetes reconciles actual state to desired state
```

The ArgoCD manifest is in:

```text
argocd/infraops-application.yaml
```

Replace the placeholder Git repository URL before applying it.
