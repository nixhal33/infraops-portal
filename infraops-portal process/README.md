# InfraOps Portal Process

This directory explains the main work done to verify, fix, and run the InfraOps Portal application.

Read the files in order:

1. `01-access-and-context.md` - how the project was inspected and matched with the original requirement.
2. `02-application-code-fixes.md` - backend/frontend code problems that were fixed.
3. `03-docker-and-runtime.md` - Docker Compose, image build, and live application verification.
4. `04-kubernetes-and-helm.md` - Kubernetes and Helm deployment fixes.
5. `05-final-runbook.md` - daily commands to run, check, stop, and troubleshoot the app.

Current live URLs:

1. Frontend: `http://localhost:8080`
2. Backend health: `http://localhost:8000/health`
3. Frontend-proxied health: `http://localhost:8080/health`
4. Metrics: `http://localhost:8080/api/monitoring/metrics`

Default login:

1. Username: `admin`
2. Password: `Admin@12345`

