# 04 - Kubernetes And Helm

## Main Goal

Make sure the future Kubernetes and Helm deployment path matches the fixed Docker/runtime behavior.

## Kubernetes Checks

1. Read backend Kubernetes manifest:

   ```bash
   sed -n '1,260p' kubernetes/base/05-backend.yaml
   ```

   Purpose: verify service, deployment, database URL, probes, and resources.

2. Read frontend Kubernetes manifest:

   ```bash
   sed -n '1,260p' kubernetes/base/06-frontend.yaml
   ```

   Purpose: verify frontend service, deployment, probes, and image settings.

3. Read ingress manifest:

   ```bash
   sed -n '1,260p' kubernetes/base/07-ingress.yaml
   ```

   Finding: ingress already routed:

   1. `/` to frontend.
   2. `/api` to backend.
   3. `/health` to backend.

4. Read network policy manifest:

   ```bash
   sed -n '1,260p' kubernetes/base/08-networkpolicy.yaml
   ```

   Fix: allowed egress to TCP `8000` so frontend nginx can proxy API traffic to backend when NetworkPolicy is enforced.

## Helm Fixes

1. Linted the Helm chart:

   ```bash
   helm lint helm/infraops-portal
   ```

   Result:

   ```text
   1 chart(s) linted, 0 chart(s) failed
   ```

2. Rendered Helm templates:

   ```bash
   helm template infraops helm/infraops-portal
   ```

   Purpose: verify generated Kubernetes YAML.

3. Fixed Helm ingress host:

   Problem:

   ```text
   infraops.local.in
   ```

   Fix:

   ```text
   infraops.local
   ```

   Purpose: match Kubernetes base manifests and README examples.

4. Added Helm backend liveness probe:

   Purpose: Kubernetes can restart backend pods if the app stops responding.

5. Added Helm frontend liveness probe:

   Purpose: Kubernetes can restart frontend pods if nginx stops responding.

6. Added Helm MariaDB readiness and liveness probes:

   Purpose: match the base Kubernetes manifest behavior.

7. Updated Helm network policy name:

   From:

   ```text
   allow-dns-and-db-egress
   ```

   To:

   ```text
   allow-dns-and-web-egress
   ```

   Purpose: make the name match what the policy actually allows: DNS, database, web, and backend proxy traffic.

8. Added Helm egress port `8000`:

   Purpose: allow frontend-to-backend API proxy traffic under default-deny egress.

