.PHONY: up down logs test-backend build-frontend zip

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f

test-backend:
	cd backend && pytest

build-frontend:
	cd frontend && npm install && npm run build

zip:
	cd .. && zip -r infraops-portal.zip infraops-portal -x "infraops-portal/frontend/node_modules/*" "infraops-portal/backend/.venv/*" "infraops-portal/*.zip"
