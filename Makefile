COMPOSE = docker-compose.prod.yml
CADDY   = docker-compose.caddy.yml

up:
	docker compose -f $(COMPOSE) up -d
down:
	docker compose -f $(COMPOSE) down
ps:
	docker compose -f $(COMPOSE) ps
logs:
	docker compose -f $(COMPOSE) logs -f --tail=200 web
health:
	curl -sS http://localhost:3000/api/health | jq .
check:
	docker compose -f $(COMPOSE) run --rm web-check
proxy-up:
	docker compose -f $(COMPOSE) -f $(CADDY) up -d caddy
proxy-down:
	docker compose -f $(COMPOSE) -f $(CADDY) down
stack:
	docker compose -f $(COMPOSE) -f $(CADDY) up -d
