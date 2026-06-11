# 02 - Application Code Fixes

## Main Goal

Fix the application-level problems that could stop the app from running correctly.

## Backend Fixes

1. Checked backend entrypoint:

   ```bash
   sed -n '1,260p' backend/app/main.py
   ```

   Purpose: verify FastAPI startup, CORS, database table creation, seed function, and route registration.

2. Checked backend settings:

   ```bash
   sed -n '1,260p' backend/app/core/config.py
   ```

   Problem found: `CORS_ORIGINS` was typed as a list. In Docker/Kubernetes it was passed as a comma-separated string, which caused Pydantic settings parsing to fail before the app could start.

3. Fixed CORS settings:

   1. Changed `cors_origins` to a plain string.
   2. Added `cors_origin_list` property.
   3. Updated FastAPI middleware to use `settings.cors_origin_list`.

   Files changed:

   1. `backend/app/core/config.py`
   2. `backend/app/main.py`

4. Checked seeded users and data:

   ```bash
   sed -n '1,320p' backend/app/services/seed.py
   ```

   Problem found: seeded emails used `.local`, for example `admin@infraops.local`. Pydantic `EmailStr` rejected those as reserved/special-use email domains during login response validation.

5. Fixed seeded emails:

   1. Changed admin email to `admin@infraopsportal.dev`.
   2. Changed operator email to `operator@infraopsportal.dev`.
   3. Made existing bad seed rows update on startup.

6. Made seed data safer for multiple backend replicas:

   Problem: Kubernetes uses two backend replicas. If both started at the same time, both could try to seed the same default rows.

   Fix:

   1. Added helper functions:
      - `_get_or_create_user`
      - `_get_or_create_asset`
      - `_get_or_create_ticket`
   2. Added `IntegrityError` handling.
   3. Made seed operation idempotent.

7. Pinned bcrypt:

   Problem: newer bcrypt versions can produce noisy Passlib compatibility warnings.

   Fix:

   ```text
   bcrypt==4.0.1
   ```

   File changed:

   ```text
   backend/requirements.txt
   ```

## Frontend Fixes

1. Checked frontend API client:

   ```bash
   sed -n '1,220p' frontend/src/api/client.js
   ```

   Finding: frontend already expected `/api` by default.

2. Checked frontend nginx config:

   ```bash
   sed -n '1,220p' frontend/nginx.conf
   ```

   Problem found: Nginx served React only. It did not proxy `/api` or `/health` to the backend container.

3. Added frontend nginx proxy rules:

   1. `/api/` proxies to `http://infraops-backend:8000/api/`.
   2. `/health` proxies to `http://infraops-backend:8000/health`.
   3. SPA routing remains under `/`.

4. Added frontend Docker ignore file:

   ```text
   frontend/.dockerignore
   ```

   Purpose: prevent `node_modules`, `dist`, `.vite`, logs, and `.env` from entering image build context.

